import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getCourses,
  createCourse,
  manualMoveStudent,
  getComplaints,
  updateComplaintStatus,
  addTimetableSlot,
  deleteTimetableSlot,
  exportMasterRoster
} from '../controllers/adminController';

const router = Router();

// Secure all admin routes to Class Reps only
router.use(authenticate);
router.use(authorize(['class_rep']));

// Course Management
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.post('/relocate-student', manualMoveStudent);

// Complaints Review
router.get('/complaints', getComplaints);
router.patch('/complaints/:complaintId', updateComplaintStatus);

// Timetable Management
router.post('/timetable', addTimetableSlot);
router.delete('/timetable/:slotId', deleteTimetableSlot);

// Reporting
router.get('/export-master', exportMasterRoster);

export default router;
