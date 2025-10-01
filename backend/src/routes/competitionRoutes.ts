import { Router } from 'express';
import { CompetitionController } from '../controllers/competitionController.ts';

const router = Router();

router.post('/', CompetitionController.create);
router.get('/', CompetitionController.getAll);
router.get('/:id', CompetitionController.getById);
router.put('/:id', CompetitionController.update);
router.delete('/:id', CompetitionController.delete);

export default router;
