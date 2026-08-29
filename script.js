const fs = require('fs');

const groupedExport = import { NextRequest, NextResponse } from 'next/server';
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

    const offering = await db.courseOffering.findUnique({
      where: { id: params.id },
      include: { unit: true, class: true }
    });

    if (!offering) return new NextResponse('Offering not found', { status: 404 });

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

    // Group students for formatting
    const groupedStudents: Record<string, typeof students> = {};
    for (const student of students) {
      if (!groupedStudents[student.group]) {
        groupedStudents[student.group] = [];
      }
      groupedStudents[student.group].push(student);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Groups Roster');

    // Define columns
    worksheet.columns = [
      { header: 'Group', key: 'group', width: 25 },
      { header: 'Full Name', key: 'fullName', width: 35 },
      { header: 'Student Number', key: 'studentNumber', width: 20 },
      { header: 'Registration Number', key: 'registrationNumber', width: 25 }
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
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
        
        [2, 3, 4].forEach(colIndex => {
          const cell = row.getCell(colIndex);
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        
        currentRow++;
      }
      
      const endRow = currentRow - 1;
      if (startRow < endRow) worksheet.mergeCells(startRow, 1, endRow, 1);
      
      const groupCell = worksheet.getCell(startRow, 1);
      groupCell.alignment = { vertical: 'middle', horizontal: 'center' };
      groupCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      groupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8EA9DB' } };
      
      if (i < groupNames.length - 1) currentRow++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    
    // Proper filename with unit code
    const unitCode = offering.unit.code.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = \groups_\.xlsx\;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': \ttachment; filename="\"\
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
\;

const alphabeticalExport = \import { NextRequest, NextResponse } from 'next/server';
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

    const offering = await db.courseOffering.findUnique({
      where: { id: params.id },
      include: { unit: true, class: true }
    });

    if (!offering) return new NextResponse('Offering not found', { status: 404 });

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
      email: user.email,
      group: user.memberships[0]?.group?.name || 'Unassigned'
    }));

    // Alphabetical sort by full name
    students.sort((a, b) => a.fullName.localeCompare(b.fullName));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Class Roster');

    // Define columns
    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 35 },
      { header: 'Student Number', key: 'studentNumber', width: 20 },
      { header: 'Registration Number', key: 'registrationNumber', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Group', key: 'group', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    students.forEach((student) => {
      worksheet.addRow(student);
    });

    // Style data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    // Proper filename with unit code
    const unitCode = offering.unit.code.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = \oster_\.xlsx\;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': \ttachment; filename="\"\
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
\;

fs.writeFileSync('apps/web/src/app/api/v1/offerings/[id]/groups/export/route.ts', groupedExport);
fs.writeFileSync('apps/web/src/app/api/v1/offerings/[id]/export/route.ts', alphabeticalExport);
console.log('Files written');
