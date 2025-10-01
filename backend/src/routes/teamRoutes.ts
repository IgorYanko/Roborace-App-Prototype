import { Router } from 'express';
import { TeamController } from '../controllers/teamController.ts';

const router = Router();

router.post('/', TeamController.create);
router.get('/competition/:competitionId', TeamController.getByCompetition);
router.get('/:id', TeamController.getById);
router.put('/:id/stats', TeamController.updateStats);
router.delete('/:id', TeamController.delete);

export default router;
