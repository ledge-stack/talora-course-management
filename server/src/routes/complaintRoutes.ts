import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { submitComplaint, getMyComplaints } from '../controllers/complaintController';

const router = Router();

router.use(authenticate);

router.post('/', submitComplaint);
router.get('/my', getMyComplaints);

export default router;
