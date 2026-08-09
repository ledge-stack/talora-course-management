import { Router } from 'express';
import { getWeeklyTimetable } from '../controllers/timetableController';

const router = Router();

// Publicly viewable by all authenticated students
router.get('/', getWeeklyTimetable);

export default router;
