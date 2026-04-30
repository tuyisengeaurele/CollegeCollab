import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { submitWork, getMySubmissions, getSubmissionsByTask, gradeSubmission } from './submissions.controller';
import { config } from '../../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: config.maxFileSize } });

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), submitWork);
router.get('/my', getMySubmissions);
router.get('/task/:taskId', authorize('LECTURER', 'ADMIN'), getSubmissionsByTask);
router.post('/:id/grade', authorize('LECTURER', 'ADMIN'), gradeSubmission);

export default router;
