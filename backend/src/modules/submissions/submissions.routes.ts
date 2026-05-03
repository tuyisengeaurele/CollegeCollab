import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { submitWork, getMySubmissions, getSubmissionsByTask, getLecturerSubmissions, gradeSubmission } from './submissions.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/gif','application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain','application/zip'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), submitWork);
router.get('/my', getMySubmissions);
router.get('/lecturer', authorize('LECTURER', 'ADMIN'), getLecturerSubmissions);
router.get('/task/:taskId', authorize('LECTURER', 'ADMIN'), getSubmissionsByTask);
router.post('/:id/grade', authorize('LECTURER', 'ADMIN'), gradeSubmission);

export default router;
