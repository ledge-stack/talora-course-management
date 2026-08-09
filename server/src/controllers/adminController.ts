import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import { Parser } from 'json2csv';

/**
 * Class Representative (Admin) Controller
 */

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.courseUnit.findMany({
      include: {
        _count: { select: { groups: true } }
      }
    });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  const { code, title, minGroupSize, maxGroupSize, allowsSwaps, submissionDeadline } = req.body;
  try {
    const course = await prisma.courseUnit.create({
      data: {
        code,
        title,
        minGroupSize: parseInt(minGroupSize) || 1,
        maxGroupSize: parseInt(maxGroupSize),
        allowsSwaps: allowsSwaps ?? true,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
      },
    });
    res.status(201).json(course);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating course', error: error.message });
  }
};

// Master Admin Override: Move student
export const manualMoveStudent = async (req: AuthRequest, res: Response) => {
  const { userId, fromGroupId, toGroupId } = req.body;

  try {
    await prisma.$transaction([
      prisma.groupMembership.delete({
        where: { groupId_userId: { groupId: fromGroupId, userId } },
      }),
      prisma.groupMembership.create({
        data: { groupId: toGroupId, userId },
      }),
    ]);
    res.json({ message: 'Student relocated successfully' });
  } catch (error: any) {
    res.status(400).json({ message: 'Relocation failed', error: error.message });
  }
};

// Complaints Management
export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: { select: { fullName: true, studentId: true, email: true } },
        courseUnit: { select: { code: true } },
        group: { select: { groupNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  const { complaintId } = req.params;
  const { status } = req.body; // 'open', 'in_review', 'resolved'

  try {
    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Status update failed', error: error.message });
  }
};

// Timetable Management
export const addTimetableSlot = async (req: AuthRequest, res: Response) => {
  const { courseUnitId, dayOfWeek, startTime, endTime, venue, lecturerName } = req.body;

  try {
    const slot = await prisma.timetableSlot.create({
      data: { courseUnitId, dayOfWeek, startTime, endTime, venue, lecturerName },
    });
    res.status(201).json(slot);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add timetable slot', error: error.message });
  }
};

export const deleteTimetableSlot = async (req: AuthRequest, res: Response) => {
  const { slotId } = req.params;

  try {
    await prisma.timetableSlot.delete({ where: { id: slotId } });
    res.json({ message: 'Slot removed' });
  } catch (error: any) {
    res.status(400).json({ message: 'Deletion failed', error: error.message });
  }
};

// Master CSV Exporter
export const exportMasterRoster = async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await prisma.groupMembership.findMany({
      include: {
        user: true,
        group: {
          include: {
            courseUnit: true,
            submissions: {
              orderBy: { version: 'desc' },
              take: 1,
            }
          }
        }
      }
    });

    const data = memberships.map(m => ({
      Course: m.group.courseUnit.code,
      GroupNumber: m.group.groupNumber,
      StudentName: m.user.fullName,
      StudentID: m.user.studentId,
      Role: m.user.role,
      IsRetake: m.isRetake ? 'Yes' : 'No',
      SubmissionStatus: m.group.submissions.length > 0 ? 'Submitted' : 'Pending',
      LastSubmitted: m.group.submissions.length > 0 ? m.group.submissions[0].submittedAt.toISOString() : 'N/A'
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`master_roster_${Date.now()}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
