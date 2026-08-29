import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';
import ExcelJS from 'exceljs';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

function generateTempPassword() {
  return crypto.randomBytes(8).toString('hex');
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader) as UserScope;
    
    if (!scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const offeringId = formData.get('offeringId') as string;
    const importType = formData.get('importType') as 'CLASS_ROSTER' | 'COURSE_ENROLLMENT';
    const mappingStr = formData.get('mapping') as string | null;
    const structureType = formData.get('structureType') as 'FLAT' | 'SECTION_BASED';
    const dryRun = formData.get('dryRun') === 'true';

    if (!file || !offeringId || !importType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify offering and get the cohort year
    const offering = await db.courseOffering.findUnique({
      where: { id: offeringId },
      include: { class: true, term: true }
    });

    if (!offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
    }

    // Attempt to extract year from cohort (e.g. "24/U" -> "24")
    // Fallback to the explicit year field on the ClassCohort model
    const cohortYearPrefix = offering.class.year.toString().slice(-2);

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedData: any[] = [];

    // --- PARSING PHASE ---
    if (structureType === 'FLAT') {
      if (!mappingStr) return NextResponse.json({ error: 'Missing column mapping' }, { status: 400 });
      const mapping = JSON.parse(mappingStr);
      
      const workbook = new ExcelJS.Workbook();
      if (file.name.endsWith('.csv')) {
        const { Readable } = require('stream');
        const stream = Readable.from(buffer);
        await workbook.csv.read(stream);
      } else {
        await workbook.xlsx.load(buffer as any);
      }
      
      const worksheet = workbook.worksheets[0];
      const allRows: any[][] = [];
      worksheet.eachRow({ includeEmpty: false }, (row) => {
        const values = Array.isArray(row.values) ? row.values.slice(1).map(v => v ? String(v).trim() : '') : [];
        if (values.some(v => v !== '')) allRows.push(values);
      });

      // Skip header row
      const dataRows = allRows.slice(1);
      
      extractedData = dataRows.map(row => {
        const getMapped = (field: string) => {
          const colIndex = Object.keys(mapping).find(key => mapping[key] === field);
          return colIndex !== undefined ? row[parseInt(colIndex)] : undefined;
        };
        
        return {
          fullName: getMapped('fullName'),
          studentNumber: getMapped('studentNumber'),
          email: getMapped('email'),
          registrationNumber: getMapped('registrationNumber'),
          groupName: getMapped('groupName'),
        };
      });

    } else {
      // SECTION_BASED AI Reparsing (full file this time)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
      
      const workbook = new ExcelJS.Workbook();
      if (file.name.endsWith('.csv')) {
        const { Readable } = require('stream');
        const stream = Readable.from(buffer);
        await workbook.csv.read(stream);
      } else {
        await workbook.xlsx.load(buffer as any);
      }
      const worksheet = workbook.worksheets[0];
      const allRows: any[][] = [];
      worksheet.eachRow({ includeEmpty: false }, (row) => {
        const values = Array.isArray(row.values) ? row.values.slice(1).map(v => v ? String(v).trim() : '') : [];
        if (values.some(v => v !== '')) allRows.push(values);
      });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // For large files, we should ideally chunk this, but for this prototype we'll send it all
      const prompt = `
        Analyze this university class list data extracted from a spreadsheet.
        It appears to be section-based (e.g. group names appearing as rows separating blocks of students).
        Extract ALL students and their assigned groups from this entire dataset.
        Return ONLY a JSON object with this exact structure:
        {"extractedRows": [{"fullName": "...", "studentNumber": "...", "email": "...", "groupName": "..."}]}
        Data: ${JSON.stringify(allRows)}
      `;

      try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/gi, '').replace(/```/gi, '').trim();
        const aiParsed = JSON.parse(text);
        extractedData = aiParsed.extractedRows;
      } catch (e) {
        return NextResponse.json({ error: 'AI parsing failed on full dataset' }, { status: 500 });
      }
    }

    // --- EXECUTION PHASE ---
    const results = {
      enrolled: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      errors: 0,
      retakers: 0,
      details: [] as any[]
    };

    // Use a transaction for safety? We'll do sequential awaits for easier error handling per-row
    for (const data of extractedData) {
      if (!data.studentNumber || !data.fullName) {
        results.errors++;
        results.details.push({ row: data, error: 'Missing required fields (Name or Student Number)' });
        continue;
      }

      let isNewEnrollment = false;
      let isGroupUpdated = false;

      const studentNumber = data.studentNumber.trim();
      const email = data.email?.trim() || null;
      
      // 1. Check Retaker Status
      // E.g. "23/U/1234" vs cohort year "24"
      const match = studentNumber.match(/^(\d{2})/);
      const rowYearPrefix = match ? match[1] : null;
      const isRetaker = rowYearPrefix && rowYearPrefix !== cohortYearPrefix;

      if (isRetaker) {
        results.retakers++;
        if (importType === 'CLASS_ROSTER') {
          results.errors++;
          results.details.push({ row: data, error: 'Retaker found in a Class Roster import. Use Course Enrollment mode instead.' });
          continue;
        }
      }

      try {
        // 2. Find or Create User
        let user = await db.user.findUnique({ where: { studentNumber } });
        
        if (!user) {
          if (!email) {
            // Partial Data - we can't create an account without an email right now.
            // In a full implementation, we'd create a "PreEnrollment" record here.
            // For now, we must skip them.
            results.skipped++;
            results.details.push({ row: data, warning: 'No email provided. Account cannot be created.' });
            continue;
          }

          if (!dryRun) {
            user = await db.user.create({
              data: {
                institutionId: offering.term.institutionId,
                fullName: data.fullName,
                studentNumber,
                email: email,
                passwordHash: generateTempPassword(), // Temp password
                registrationNumber: data.registrationNumber,
                isActive: true,
                isEmailVerified: false,
              }
            });
          } else {
            user = { id: `temp-user-${studentNumber}` } as any;
          }
        }

        // 3. Add to ClassCohort if it's a CLASS_ROSTER import and they aren't a retaker
        if (importType === 'CLASS_ROSTER' && !isRetaker) {
          const roleExists = await db.userRole.findFirst({
            where: { userId: user!.id, role: 'STUDENT', classId: offering.classId }
          });
          
          if (!roleExists && !dryRun) {
            await db.userRole.create({
              data: {
                userId: user!.id,
                role: 'STUDENT',
                classId: offering.classId
              }
            });
          }
        }

        // 4. Enroll in CourseOffering
        const enrollmentExists = await db.enrollment.findUnique({
          where: { studentId_offeringId: { studentId: user!.id, offeringId: offering.id } }
        });

        if (!enrollmentExists) {
          if (!dryRun) {
            await db.enrollment.create({
              data: { studentId: user!.id, offeringId: offering.id }
            });
          }
          isNewEnrollment = true;
        }

        // 5. Handle Group Assignment
        if (data.groupName) {
          let group = await db.group.findFirst({
            where: { offeringId: offering.id, name: data.groupName }
          });

          // Create group if it doesn't exist
          if (!group) {
            if (!dryRun) {
              group = await db.group.create({
                data: {
                  offeringId: offering.id,
                  name: data.groupName,
                  leaderId: user!.id, // Set the first imported student as the leader
                  status: 'INCOMPLETE',
                  isOpen: true,
                }
              });
            } else {
              group = { id: `temp-group-${data.groupName}` } as any;
            }
          }

          // Assign membership
          const membershipExists = await db.groupMembership.findUnique({
            where: { studentId_offeringId: { studentId: user!.id, offeringId: offering.id } }
          });

          if (!membershipExists) {
             // Basic capacity check
             const memberCount = await db.groupMembership.count({ where: { groupId: group!.id } });
             if (memberCount < offering.maxGroupSize || dryRun) {
               if (!dryRun) {
                 await db.groupMembership.create({
                   data: { studentId: user!.id, groupId: group!.id, offeringId: offering.id }
                 });
               }
               isGroupUpdated = true;
             } else {
               results.details.push({ row: data, warning: `Group '${data.groupName}' is full. Enrolled as ungrouped.` });
             }
          } else if (membershipExists.groupId !== group!.id) {
             // User is in a different group, update their group
             const memberCount = await db.groupMembership.count({ where: { groupId: group!.id } });
             if (memberCount < offering.maxGroupSize || dryRun) {
               if (!dryRun) {
                 await db.groupMembership.update({
                   where: { studentId_offeringId: { studentId: user!.id, offeringId: offering.id } },
                   data: { groupId: group!.id }
                 });
               }
               isGroupUpdated = true;
               results.details.push({ row: data, warning: `Moved from previous group to '${data.groupName}'.` });
             } else {
               results.details.push({ row: data, warning: `Group '${data.groupName}' is full. Kept in previous group.` });
             }
          }
        }

        if (isNewEnrollment) {
          results.enrolled++;
        } else if (isGroupUpdated) {
          results.updated++;
        } else {
          results.unchanged++;
        }

      } catch (err: any) {
        console.error('Error importing row:', err);
        results.errors++;
        results.details.push({ row: data, error: err.message });
      }
    }

    return NextResponse.json({ data: results });

  } catch (error) {
    console.error('Error executing import:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
