import { Router } from 'express';
import { MatchController } from '../controllers/matchController.ts';

const router = Router();

router.post('/', MatchController.create);
router.get('/competition/:competitionId', MatchController.getByCompetition);
router.get('/competition/:competitionId/phase/:phase', MatchController.getByPhase);
router.put('/:id/result', MatchController.updateResult);

router.post('/competition/:competitionId/generate-group', MatchController.generateGroupMatches);
router.post('/competition/:competitionId/generate-semifinals', MatchController.generateSemifinals);
router.post('/competition/:competitionId/generate-finals', MatchController.generateThirdPlaceAndFinal);

export default router;
