import { Request, Response } from 'express';
import prisma from '../db';

/**
 * Public/Student Timetable Controller
 */

export const getWeeklyTimetable = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.timetableSlot.findMany({
      include: {
        courseUnit: { select: { code: true, title: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' }, // Note: Logical sorting (Mon-Sun) usually handled in frontend
        { startTime: 'asc' },
      ],
    });

    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
};
