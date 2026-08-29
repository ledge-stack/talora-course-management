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
      include: { class: true, unit: true }
    });
    
    if (!offering) return new NextResponse('Not found', { status: 404 });

    const rosterUsers = await db.user.findMany({
      where: {
        OR: [
          { enrollments: { some: { offeringId: params.id } } },
          { memberships: { some: { offeringId: params.id } } }
        ]
      }
    });

    // Flat alphabetical list
    const students = rosterUsers.map(user => ({
      fullName: user.fullName,
      studentNumber: user.studentNumber || '',
      registrationNumber: user.registrationNumber || '',
      phoneNumber: user.phoneNumber || 'N/A'
    }));

    students.sort((a, b) => a.fullName.localeCompare(b.fullName));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Class Roster');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 35 },
      { header: 'Student Number', key: 'studentNumber', width: 20 },
      { header: 'Registration Number', key: 'registrationNumber', width: 25 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // Primary color
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    students.forEach(student => {
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
    
    const safeClassName = offering.class.name.replace(/[^a-z0-9]/gi, '_');
    const safeUnitCode = offering.unit.code.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeClassName}_${safeUnitCode}_Roster.xlsx`;

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
