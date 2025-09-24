import { Router } from 'express';
import { PlayerController } from '../controllers/playerController.js';

const router = Router();

router.post('/', PlayerController.create);
router.get('/team/:teamId', PlayerController.getByTeam);
router.get('/:id', PlayerController.getById);
router.put('/:id', PlayerController.update);
router.delete('/:id', PlayerController.delete);

export default router;
