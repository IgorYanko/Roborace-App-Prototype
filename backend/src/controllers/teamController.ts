import type { Request, Response } from 'express';
import { TeamModel } from '../models/Team.js';
import { PlayerModel } from '../models/Player.js';

export class TeamController {
  static async create(req: Request, res: Response) {
    try {
      const { name, institution, competitionId } = req.body;
      
      if (!name || !institution || !competitionId) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const team = await TeamModel.create({
        name,
        institution,
        competitionId
      });

      res.status(201).json(team);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getByCompetition(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      const teams = await TeamModel.findByCompetitionId(parseInt(competitionId!));
      res.json(teams);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const team = await TeamModel.findById(parseInt(id!));
      
      if (!team) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      const players = await PlayerModel.findByTeamId(parseInt(id!));
      
      res.json({ ...team, players });
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { result } = req.body;
      
      if (!['win', 'draw', 'loss'].includes(result)) {
        return res.status(400).json({ error: 'Resultado deve ser win, draw ou loss' });
      }

      const team = await TeamModel.updateStats(parseInt(id!), result);
      
      if (!team) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      res.json(team);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas da equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await TeamModel.delete(parseInt(id!));
      
      if (!deleted) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
