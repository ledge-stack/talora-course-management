import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import * as ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return new NextResponse('Unauthorized', { status: 401 });
    const scope = JSON.parse(scopeHeader);
    
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return new NextResponse('Forbidden', { status: 403 });

    const rosterUsers = await db.user.findMany({
      where: {
        OR: [
          { enrollments: { some: { offeringId: params.id } } },
          { memberships: { some: { offeringId: params.id } } }
        ]
      },
      include: {
        memberships: {
          where: { offeringId: params.id },
          include: { group: true }
        }
      }
    });

    const students = rosterUsers.map(user => ({
      fullName: user.fullName,
      studentNumber: user.studentNumber || '',
      registrationNumber: user.registrationNumber || '',
      group: user.memberships[0]?.group?.name || 'Unassigned'
    }));

    // Sort by group name (natural numeric sort), then by full name
    students.sort((a, b) => {
      const groupCompare = a.group.localeCompare(b.group, undefined, { numeric: true, sensitivity: 'base' });
      if (groupCompare !== 0) return groupCompare;
      return a.fullName.localeCompare(b.fullName);
    });

    // Group students for formatting (merges and blank rows)
    const groupedStudents: Record<string, typeof students> = {};
    for (const student of students) {
      if (!groupedStudents[student.group]) {
        groupedStudents[student.group] = [];
      }
      groupedStudents[student.group].push(student);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Class Roster');

    // Define columns
    worksheet.columns = [
      { header: 'Group', key: 'group', width: 25 },
      { header: 'Full Name', key: 'fullName', width: 35 },
      { header: 'Student Number', key: 'studentNumber', width: 20 },
      { header: 'Registration Number', key: 'registrationNumber', width: 25 }
    ];

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let currentRow = 2;

    const groupNames = Object.keys(groupedStudents);
    for (let i = 0; i < groupNames.length; i++) {
      const groupName = groupNames[i];
      const members = groupedStudents[groupName];
      
      const startRow = currentRow;
      
      for (const member of members) {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = member.group;
        row.getCell(2).value = member.fullName;
        row.getCell(3).value = member.studentNumber;
        row.getCell(4).value = member.registrationNumber;
        
        // Apply borders to data cells
        [2, 3, 4].forEach(colIndex => {
          const cell = row.getCell(colIndex);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        
        currentRow++;
      }
      
      const endRow = currentRow - 1;
      
      // Merge Group column
      if (startRow < endRow) {
        worksheet.mergeCells(startRow, 1, endRow, 1);
      }
      
      // Style the merged Group cell
      const groupCell = worksheet.getCell(startRow, 1);
      groupCell.alignment = { vertical: 'middle', horizontal: 'center' };
      groupCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Apply blue background if it's an actual group (not 'Unassigned')
      // Actually, in the screenshot even group rows have the blue fill
      groupCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8EA9DB' } // The specific light blue from the screenshot
      };
      
      // Add empty row if it's not the last group
      if (i < groupNames.length - 1) {
        // Leave row empty and without borders
        currentRow++;
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="class_roster_${params.id}.xlsx"`
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
