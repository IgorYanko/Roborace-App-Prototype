import type { Request, Response } from 'express';
import { CompetitionModel } from '../models/Competition.ts';

export class CompetitionController {
  static async create(req: Request, res: Response) {
    try {
      const { name, maxTeams, maxPlayersPerTeam } = req.body;
      
      if (!name || !maxTeams || !maxPlayersPerTeam) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const competition = await CompetitionModel.create({
        name,
        maxTeams,
        maxPlayersPerTeam
      });

      res.status(201).json(competition);
    } catch (error) {
      console.error('Erro ao criar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const competitions = await CompetitionModel.findAll();
      res.json(competitions);
    } catch (error) {
      console.error('Erro ao buscar competições:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const competition = await CompetitionModel.findById(parseInt(id!));
      
      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      res.json(competition);
    } catch (error) {
      console.error('Erro ao buscar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const competition = await CompetitionModel.update(parseInt(id!), updates);
      
      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      res.json(competition);
    } catch (error) {
      console.error('Erro ao atualizar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await CompetitionModel.delete(parseInt(id!));
      
      if (!deleted) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
