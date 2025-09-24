import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateCompetitionRequest, UpdateCompetitionRequest, CompetitionStatus } from '../models/Competition';

export class CompetitionController {
  async getAll(req: Request, res: Response) {
    try {
      const competitions = await prisma.competition.findMany({
        include: {
          teams: {
            include: {
              participants: true
            }
          },
          _count: {
            select: {
              teams: true,
              matches: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(competitions);
    } catch (error) {
      console.error('Erro ao buscar competições:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const competition = await prisma.competition.findUnique({
        where: { id },
        include: {
          teams: {
            include: {
              participants: true
            }
          },
          matches: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          },
          classifications: {
            include: {
              team: true
            },
            orderBy: {
              points: 'desc'
            }
          }
        }
      });

      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      res.json(competition);
    } catch (error) {
      console.error('Erro ao buscar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: CreateCompetitionRequest = req.body;

      const competition = await prisma.competition.create({
        data: {
          name: data.name,
          maxTeams: data.maxTeams,
          maxParticipantsPerTeam: data.maxParticipantsPerTeam,
          status: CompetitionStatus.ACTIVE
        }
      });

      res.status(201).json(competition);
    } catch (error) {
      console.error('Erro ao criar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateCompetitionRequest = req.body;

      const competition = await prisma.competition.update({
        where: { id },
        data
      });

      res.json(competition);
    } catch (error) {
      console.error('Erro ao atualizar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.competition.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getTeams(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const teams = await prisma.team.findMany({
        where: { competitionId: id },
        include: {
          participants: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      res.json(teams);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getMatches(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const matches = await prisma.match.findMany({
        where: { competitionId: id },
        include: {
          homeTeam: true,
          awayTeam: true
        },
        orderBy: [
          { matchType: 'asc' },
          { round: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getClassification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const classifications = await prisma.classification.findMany({
        where: { competitionId: id },
        include: {
          team: true
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ]
      });

      res.json(classifications);
    } catch (error) {
      console.error('Erro ao buscar classificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async generateGroupMatches(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const competition = await prisma.competition.findUnique({
        where: { id },
        include: { teams: true }
      });

      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      if (competition.teams.length < 2) {
        return res.status(400).json({ error: 'É necessário pelo menos 2 equipes para gerar partidas' });
      }

      const matches = [];
      const teams = competition.teams;

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            competitionId: id,
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
            matchType: 'GROUP_STAGE'
          });
        }
      }

      const createdMatches = await prisma.match.createMany({
        data: matches
      });

      res.status(201).json({
        message: `${createdMatches.count} partidas geradas com sucesso`,
        matches: createdMatches.count
      });
    } catch (error) {
      console.error('Erro ao gerar partidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async generatePlayoffs(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const topTeams = await prisma.classification.findMany({
        where: { competitionId: id },
        include: { team: true },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ],
        take: 4
      });

      if (topTeams.length < 4) {
        return res.status(400).json({ error: 'É necessário pelo menos 4 equipes para gerar mata-mata' });
      }

      const semifinals = [
        {
          competitionId: id,
          homeTeamId: topTeams[0].teamId,
          awayTeamId: topTeams[3].teamId,
          matchType: 'SEMIFINAL',
          round: 1
        },
        {
          competitionId: id,
          homeTeamId: topTeams[1].teamId,
          awayTeamId: topTeams[2].teamId,
          matchType: 'SEMIFINAL',
          round: 1
        }
      ];

      const createdSemifinals = await prisma.match.createMany({
        data: semifinals
      });

      res.status(201).json({
        message: 'Semifinais geradas com sucesso',
        semifinals: createdSemifinals.count
      });
    } catch (error) {
      console.error('Erro ao gerar mata-mata:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
