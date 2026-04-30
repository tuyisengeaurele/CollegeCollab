import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { createTask, getTasks, getMyTasks, getTaskById, updateTask, deleteTask } from './tasks.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/my', getMyTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('LECTURER', 'ADMIN'), createTask);
router.put('/:id', authorize('LECTURER', 'ADMIN'), updateTask);
router.delete('/:id', authorize('LECTURER', 'ADMIN'), deleteTask);

export default router;
