import type { Request, Response } from 'express';
import { MatchModel } from '../models/Match.js';
import { TeamModel } from '../models/Team.js';

export class MatchController {
  static async create(req: Request, res: Response) {
    try {
      const { team1Id, team2Id, competitionId, phase } = req.body;
      
      if (!team1Id || !team2Id || !competitionId || !phase) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const match = await MatchModel.create({
        team1Id,
        team2Id,
        competitionId,
        result: null,
        phase,
        matchDate: null
      });

      res.status(201).json(match);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getByCompetition(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      const matches = await MatchModel.findByCompetitionId(parseInt(competitionId!));
      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getByPhase(req: Request, res: Response) {
    try {
      const { competitionId, phase } = req.params;
      const matches = await MatchModel.findByPhase(parseInt(competitionId!), phase!);
      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas por fase:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { result } = req.body;
      
      if (!['team1_win', 'team2_win', 'draw'].includes(result)) {
        return res.status(400).json({ error: 'Resultado deve ser team1_win, team2_win ou draw' });
      }

      const match = await MatchModel.updateResult(parseInt(id!), result);
      
      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada' });
      }

      if (result === 'team1_win') {
        await TeamModel.updateStats(match.team1Id, 'win');
        await TeamModel.updateStats(match.team2Id, 'loss');
      } else if (result === 'team2_win') {
        await TeamModel.updateStats(match.team1Id, 'loss');
        await TeamModel.updateStats(match.team2Id, 'win');
      } else if (result === 'draw') {
        await TeamModel.updateStats(match.team1Id, 'draw');
        await TeamModel.updateStats(match.team2Id, 'draw');
      }

      res.json(match);
    } catch (error) {
      console.error('Erro ao atualizar resultado da partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async generateGroupMatches(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      const { teamIds } = req.body;
      
      if (!teamIds || !Array.isArray(teamIds)) {
        return res.status(400).json({ error: 'teamIds deve ser um array' });
      }

      const matches = await MatchModel.generateGroupMatches(parseInt(competitionId!), teamIds);
      res.status(201).json(matches);
    } catch (error) {
      console.error('Erro ao gerar partidas do grupo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async generateSemifinals(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      const { top4Teams } = req.body;
      
      if (!top4Teams || !Array.isArray(top4Teams) || top4Teams.length !== 4) {
        return res.status(400).json({ error: 'top4Teams deve ser um array com 4 equipes' });
      }

      const matches = await MatchModel.generateSemifinals(parseInt(competitionId!), top4Teams);
      res.status(201).json(matches);
    } catch (error) {
      console.error('Erro ao gerar semifinais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async generateThirdPlaceAndFinal(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      const { semifinalWinners, semifinalLosers } = req.body;
      
      if (!semifinalWinners || !semifinalLosers || 
          !Array.isArray(semifinalWinners) || !Array.isArray(semifinalLosers) ||
          semifinalWinners.length !== 2 || semifinalLosers.length !== 2) {
        return res.status(400).json({ error: 'semifinalWinners e semifinalLosers devem ser arrays com 2 equipes cada' });
      }

      const matches = await MatchModel.generateThirdPlaceAndFinal(
        parseInt(competitionId!), 
        semifinalWinners, 
        semifinalLosers
      );
      res.status(201).json(matches);
    } catch (error) {
      console.error('Erro ao gerar disputa do 3º lugar e final:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
