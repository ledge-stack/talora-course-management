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
    const filename = `class_roster_${unitCode}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
