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
      include: {
        groups: {
          include: {
            leader: true,
            _count: {
              select: { members: true }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!offering) return new NextResponse('Offering not found', { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Groups List');

    worksheet.columns = [
      { header: 'Group Name', key: 'name', width: 25 },
      { header: 'Leader', key: 'leader', width: 35 },
      { header: 'Leader Phone', key: 'leaderPhone', width: 20 },
      { header: 'Members', key: 'members', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Privacy', key: 'privacy', width: 15 }
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

    // Add data rows
    offering.groups.forEach((group) => {
      worksheet.addRow({
        name: group.name,
        leader: group.leader?.fullName || 'No Leader',
        leaderPhone: group.leader?.phoneNumber || 'N/A',
        members: `${group._count.members} / ${offering.maxGroupSize}`,
        status: group.status,
        privacy: group.isOpen ? 'Open' : 'Invite Only'
      });
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

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="groups_list_${params.id}.xlsx"`
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
