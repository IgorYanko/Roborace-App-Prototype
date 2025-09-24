import type { Request, Response } from 'express';
import { PlayerModel } from '../models/Player.js';

export class PlayerController {
  static async create(req: Request, res: Response) {
    try {
      const { name, teamId } = req.body;
      
      if (!name || !teamId) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const player = await PlayerModel.create({
        name,
        teamId
      });

      res.status(201).json(player);
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getByTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const players = await PlayerModel.findByTeamId(parseInt(teamId!));
      res.json(players);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const player = await PlayerModel.findById(parseInt(id!));
      
      if (!player) {
        return res.status(404).json({ error: 'Jogador não encontrado' });
      }

      res.json(player);
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const player = await PlayerModel.update(parseInt(id!), updates);
      
      if (!player) {
        return res.status(404).json({ error: 'Jogador não encontrado' });
      }

      res.json(player);
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await PlayerModel.delete(parseInt(id!));
      
      if (!deleted) {
        return res.status(404).json({ error: 'Jogador não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
