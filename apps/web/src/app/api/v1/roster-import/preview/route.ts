import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';
import ExcelJS from 'exceljs';
import Fuse from 'fuse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const FIELD_SYNONYMS = {
  fullName:           ['name', 'full name', 'student name', 'surname', 'fullname', 'first name', 'last name'],
  studentNumber:      ['std no', 'student no', 'student number', 'stdno', 'student id', 'registration', 'reg no', 'reg number'], // Grouped for initial fuzzy matching
  email:              ['email', 'e-mail', 'email address', 'mail'],
  registrationNumber: ['reg no', 'reg. no.', 'registration', 'reg number', 'regno'],
  groupName:          ['group', 'grp', 'group name', 'tutorial', 'tut group'],
};

// Create a flat list of synonyms mapped to their target field for Fuse
const synonymList = Object.entries(FIELD_SYNONYMS).flatMap(([field, synonyms]) => 
  synonyms.map(synonym => ({ synonym, field }))
);

const fuse = new Fuse(synonymList, {
  keys: ['synonym'],
  threshold: 0.3 // Require fairly good matches
});

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Authorization check
    if (!scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Read file into a 2D array
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    
    if (file.name.endsWith('.csv')) {
      // Create a stream from the buffer to make csv.read happy
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Readable } = require('stream');
      const stream = Readable.from(buffer);
      await workbook.csv.read(stream);
    } else {
      await workbook.xlsx.load(buffer as any);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: 'Spreadsheet is empty' }, { status: 400 });
    }

    const allRows: any[][] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // row.values is 1-indexed in exceljs
      const values = Array.isArray(row.values) 
        ? row.values.slice(1).map(v => v ? String(v).trim() : '')
        : [];
      // Filter out empty rows
      if (values.some(v => v !== '')) {
         allRows.push(values);
      }
    });

    if (allRows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // 2. Detect Structure Type
    let structureType: 'FLAT' | 'SECTION_BASED' = 'FLAT';
    
    // Count rows that only have 1 non-empty cell (potential section headers)
    const singleCellRows = allRows.filter(row => row.filter(cell => cell !== '').length === 1);
    
    // If we have multiple such rows, and they contain words like "group" or just short strings, it's likely section-based
    const likelySectionHeaders = singleCellRows.filter(row => {
      const val = row.find(cell => cell !== '') || '';
      const vLower = val.toLowerCase();
      return vLower.includes('group') || vLower.includes('grp') || vLower.includes('tut') || (val.length < 20 && val.length > 2);
    });

    if (likelySectionHeaders.length >= 2) {
      structureType = 'SECTION_BASED';
    }

    // 3. Process based on structure
    if (structureType === 'FLAT') {
      // Find the header row - assume it's the first non-empty row for now
      const headerRow = allRows[0];
      const dataRows = allRows.slice(1, 6); // Take up to 5 rows for sample

      // Auto-map columns using Fuse
      const mappingSuggestions: Record<string, string> = {};
      
      headerRow.forEach((header, index) => {
        if (!header) return;
        const result = fuse.search(header);
        if (result.length > 0) {
          mappingSuggestions[index.toString()] = result[0].item.field;
        }
      });

      return NextResponse.json({
        data: {
          structureType,
          columns: headerRow,
          sampleRows: dataRows,
          suggestedMapping: mappingSuggestions,
          totalRowsDetected: allRows.length - 1
        }
      });
      
    } else {
      // SECTION_BASED - Attempt AI Extraction if API key is present
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        // Fallback if no AI key: return raw structure and warn
        return NextResponse.json({
          data: {
            structureType,
            warning: 'Section-based structure detected, but AI parsing is not configured. Please use a flat table.',
            rawRows: allRows.slice(0, 15) // Give them a peek at what we saw
          }
        });
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // We only send a sample to save tokens and time
        const sampleToAnalyze = allRows.slice(0, 30);
        
        const prompt = `
          Analyze this university class list data extracted from a spreadsheet.
          It appears to be section-based (e.g. group names appearing as rows separating blocks of students).
          
          Extract the students and their assigned groups from this data.
          
          Return ONLY a JSON object with this exact structure:
          {
            "extractedRows": [
              {
                "fullName": "Student's name",
                "studentNumber": "Student number if found",
                "email": "Email if found",
                "groupName": "The group name this student belongs to, based on the section header above them"
              }
            ]
          }
          
          Do not include markdown backticks or any other text. Just the raw JSON.
          
          Data:
          ${JSON.stringify(sampleToAnalyze)}
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean up markdown if Gemini ignored the instruction
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        let aiParsed;
        try {
          aiParsed = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse Gemini response:", text);
          throw new Error("AI returned invalid JSON");
        }

        return NextResponse.json({
          data: {
            structureType,
            extractedSample: aiParsed.extractedRows,
            totalRowsAnalyzed: sampleToAnalyze.length,
            message: 'AI successfully analyzed the structure. You can proceed to import.'
          }
        });

      } catch (aiError) {
        console.error("AI Analysis failed:", aiError);
        return NextResponse.json({ error: 'AI structure analysis failed' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error previewing import:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
