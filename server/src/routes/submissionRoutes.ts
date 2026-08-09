import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { uploadSubmission } from '../controllers/submissionController';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadSubmission);

export default router;
