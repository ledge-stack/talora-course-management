import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createGroup,
  updateWhatsAppLink,
  applyToGroup,
  respondToApplication,
  directAddMember,
  mergeGroups,
  manageDefaultTemplate,
  getPendingApplications,
  getGroupsByCourse,
  getDefaultTemplate
} from '../controllers/groupController';

const router = Router();

router.use(authenticate);

// Student & Leader Routes
router.get('/applications/pending', authorize(['group_leader', 'class_rep']), getPendingApplications);
router.get('/course/:courseUnitId', getGroupsByCourse);
router.post('/', createGroup);
router.patch('/:groupId/whatsapp', updateWhatsAppLink);
router.post('/apply', applyToGroup);
router.post('/application/:applicationId/respond', respondToApplication);
router.post('/add-member', directAddMember);
router.post('/template', manageDefaultTemplate);
router.get('/template', getDefaultTemplate);

// Admin (Class Rep) Overrides
router.post('/merge', authorize(['class_rep']), mergeGroups);

export default router;
