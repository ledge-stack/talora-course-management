import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';

/**
 * Student Complaints Controller
 */

export const submitComplaint = async (req: AuthRequest, res: Response) => {
  const { subject, description, courseUnitId, groupId } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const complaint = await prisma.complaint.create({
      data: {
        submittedBy: userId,
        subject,
        description,
        courseUnitId,
        groupId,
        status: 'open',
      },
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to submit complaint', error: error.message });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const complaints = await prisma.complaint.findMany({
      where: { submittedBy: userId },
      include: {
        courseUnit: { select: { code: true, title: true } },
        group: { select: { groupNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};
