import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateTeamRequest, UpdateTeamRequest, CreateParticipantRequest } from '../models/Team';

export class TeamController {
  async getAll(req: Request, res: Response) {
    try {
      const teams = await prisma.team.findMany({
        include: {
          participants: true,
          competition: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(teams);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          participants: true,
          competition: true
        }
      });

      if (!team) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      res.json(team);
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: CreateTeamRequest = req.body;

      const competition = await prisma.competition.findUnique({
        where: { id: data.competitionId }
      });

      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      const existingTeam = await prisma.team.findFirst({
        where: {
          name: data.name,
          competitionId: data.competitionId
        }
      });

      if (existingTeam) {
        return res.status(400).json({ error: 'Já existe uma equipe com este nome nesta competição' });
      }

      const teamCount = await prisma.team.count({
        where: { competitionId: data.competitionId }
      });

      if (teamCount >= competition.maxTeams) {
        return res.status(400).json({ error: 'Limite máximo de equipes atingido para esta competição' });
      }

      if (data.participants.length > competition.maxParticipantsPerTeam) {
        return res.status(400).json({ 
          error: `Máximo de ${competition.maxParticipantsPerTeam} participantes por equipe` 
        });
      }

      const team = await prisma.team.create({
        data: {
          name: data.name,
          institution: data.institution,
          competitionId: data.competitionId,
          participants: {
            create: data.participants.map(participant => ({
              name: participant.name,
              email: participant.email
            }))
          }
        },
        include: {
          participants: true,
          competition: true
        }
      });

      res.status(201).json(team);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateTeamRequest = req.body;

      const team = await prisma.team.update({
        where: { id },
        data: {
          name: data.name,
          institution: data.institution
        },
        include: {
          participants: true,
          competition: true
        }
      });

      res.json(team);
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.team.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getParticipants(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const participants = await prisma.participant.findMany({
        where: { teamId: id },
        orderBy: {
          name: 'asc'
        }
      });

      res.json(participants);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addParticipant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: CreateParticipantRequest = req.body;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          participants: true,
          competition: true
        }
      });

      if (!team) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      if (team.participants.length >= team.competition.maxParticipantsPerTeam) {
        return res.status(400).json({ 
          error: `Máximo de ${team.competition.maxParticipantsPerTeam} participantes por equipe` 
        });
      }

      const participant = await prisma.participant.create({
        data: {
          name: data.name,
          email: data.email,
          teamId: id
        }
      });

      res.status(201).json(participant);
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateParticipant(req: Request, res: Response) {
    try {
      const { id, participantId } = req.params;
      const data: CreateParticipantRequest = req.body;

      const participant = await prisma.participant.update({
        where: { 
          id: participantId,
          teamId: id
        },
        data: {
          name: data.name,
          email: data.email
        }
      });

      res.json(participant);
    } catch (error) {
      console.error('Erro ao atualizar participante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeParticipant(req: Request, res: Response) {
    try {
      const { id, participantId } = req.params;

      await prisma.participant.delete({
        where: { 
          id: participantId,
          teamId: id
        }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
