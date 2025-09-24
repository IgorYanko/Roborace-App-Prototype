import { Request, Response } from 'express';
import prisma from '../config/database';
import { CreateMatchRequest, UpdateMatchRequest, MatchStatus } from '../models/Match';

export class MatchController {
  async getAll(req: Request, res: Response) {
    try {
      const matches = await prisma.match.findMany({
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        }
      });

      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada' });
      }

      res.json(match);
    } catch (error) {
      console.error('Erro ao buscar partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: CreateMatchRequest = req.body;

      const [homeTeam, awayTeam] = await Promise.all([
        prisma.team.findUnique({
          where: { id: data.homeTeamId },
          include: { competition: true }
        }),
        prisma.team.findUnique({
          where: { id: data.awayTeamId },
          include: { competition: true }
        })
      ]);

      if (!homeTeam || !awayTeam) {
        return res.status(404).json({ error: 'Uma ou ambas as equipes não foram encontradas' });
      }

      if (homeTeam.competitionId !== awayTeam.competitionId) {
        return res.status(400).json({ error: 'As equipes devem pertencer à mesma competição' });
      }

      if (data.homeTeamId === data.awayTeamId) {
        return res.status(400).json({ error: 'Uma equipe não pode jogar contra si mesma' });
      }

      const existingMatch = await prisma.match.findFirst({
        where: {
          competitionId: data.competitionId,
          OR: [
            {
              homeTeamId: data.homeTeamId,
              awayTeamId: data.awayTeamId
            },
            {
              homeTeamId: data.awayTeamId,
              awayTeamId: data.homeTeamId
            }
          ]
        }
      });

      if (existingMatch) {
        return res.status(400).json({ error: 'Já existe uma partida entre essas equipes' });
      }

      const match = await prisma.match.create({
        data: {
          competitionId: data.competitionId,
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
          matchType: data.matchType || 'GROUP_STAGE',
          round: data.round
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        }
      });

      res.status(201).json(match);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateMatchRequest = req.body;

      const match = await prisma.match.update({
        where: { id },
        data,
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        }
      });

      res.json(match);
    } catch (error) {
      console.error('Erro ao atualizar partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.match.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar partida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { homeScore, awayScore } = req.body;

      if (homeScore === undefined || awayScore === undefined) {
        return res.status(400).json({ error: 'Placar da casa e visitante são obrigatórios' });
      }

      if (homeScore < 0 || awayScore < 0) {
        return res.status(400).json({ error: 'Placar não pode ser negativo' });
      }

      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });

      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada' });
      }

      const updatedMatch = await prisma.match.update({
        where: { id },
        data: {
          homeScore,
          awayScore,
          status: MatchStatus.COMPLETED
        },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });

      await this.updateClassification(match.competitionId, match.homeTeamId, match.awayTeamId, homeScore, awayScore);

      res.json(updatedMatch);
    } catch (error) {
      console.error('Erro ao atualizar resultado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(MatchStatus).includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const match = await prisma.match.update({
        where: { id },
        data: { status },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        }
      });

      res.json(match);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getByCompetition(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;

      const matches = await prisma.match.findMany({
        where: { competitionId },
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
      console.error('Erro ao buscar partidas da competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getByTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;

      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
          ]
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(matches);
    } catch (error) {
      console.error('Erro ao buscar partidas da equipe:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  private async updateClassification(competitionId: string, homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number) {
    try {
      const [homeClassification, awayClassification] = await Promise.all([
        prisma.classification.upsert({
          where: {
            competitionId_teamId: {
              competitionId,
              teamId: homeTeamId
            }
          },
          update: {},
          create: {
            competitionId,
            teamId: homeTeamId
          }
        }),
        prisma.classification.upsert({
          where: {
            competitionId_teamId: {
              competitionId,
              teamId: awayTeamId
            }
          },
          update: {},
          create: {
            competitionId,
            teamId: awayTeamId
          }
        })
      ]);

      let homePoints = 0, homeWins = 0, homeDraws = 0, homeLosses = 0;
      let awayPoints = 0, awayWins = 0, awayDraws = 0, awayLosses = 0;

      if (homeScore > awayScore) {
        homePoints = 2;
        homeWins = 1;
        awayLosses = 1;
      } else if (homeScore < awayScore) {
        awayPoints = 2;
        awayWins = 1;
        homeLosses = 1;
      } else {
        homePoints = 1;
        awayPoints = 1;
        homeDraws = 1;
        awayDraws = 1;
      }

      await Promise.all([
        prisma.classification.update({
          where: { id: homeClassification.id },
          data: {
            points: homeClassification.points + homePoints,
            wins: homeClassification.wins + homeWins,
            draws: homeClassification.draws + homeDraws,
            losses: homeClassification.losses + homeLosses,
            goalsFor: homeClassification.goalsFor + homeScore,
            goalsAgainst: homeClassification.goalsAgainst + awayScore,
            goalDifference: (homeClassification.goalsFor + homeScore) - (homeClassification.goalsAgainst + awayScore)
          }
        }),
        prisma.classification.update({
          where: { id: awayClassification.id },
          data: {
            points: awayClassification.points + awayPoints,
            wins: awayClassification.wins + awayWins,
            draws: awayClassification.draws + awayDraws,
            losses: awayClassification.losses + awayLosses,
            goalsFor: awayClassification.goalsFor + awayScore,
            goalsAgainst: awayClassification.goalsAgainst + homeScore,
            goalDifference: (awayClassification.goalsFor + awayScore) - (awayClassification.goalsAgainst + homeScore)
          }
        })
      ]);

      await this.recalculatePositions(competitionId);
    } catch (error) {
      console.error('Erro ao atualizar classificação:', error);
    }
  }

  private async recalculatePositions(competitionId: string) {
    const classifications = await prisma.classification.findMany({
      where: { competitionId },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    for (let i = 0; i < classifications.length; i++) {
      await prisma.classification.update({
        where: { id: classifications[i].id },
        data: { position: i + 1 }
      });
    }
  }
}
