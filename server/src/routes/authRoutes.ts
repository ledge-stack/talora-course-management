import { Router } from 'express';
import { login, register, getStudentByStudentId } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/student/:studentId', getStudentByStudentId);

export default router;
