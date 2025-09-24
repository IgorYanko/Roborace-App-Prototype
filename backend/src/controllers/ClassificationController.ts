import { Request, Response } from 'express';
import prisma from '../config/database';
import { UpdateClassificationRequest } from '../models/Classification';

export class ClassificationController {
  async getAll(req: Request, res: Response) {
    try {
      const classifications = await prisma.classification.findMany({
        include: {
          team: true,
          competition: true
        },
        orderBy: [
          { competitionId: 'asc' },
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ]
      });

      res.json(classifications);
    } catch (error) {
      console.error('Erro ao buscar classificações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const classification = await prisma.classification.findUnique({
        where: { id },
        include: {
          team: true,
          competition: true
        }
      });

      if (!classification) {
        return res.status(404).json({ error: 'Classificação não encontrada' });
      }

      res.json(classification);
    } catch (error) {
      console.error('Erro ao buscar classificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getByCompetition(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;

      const classifications = await prisma.classification.findMany({
        where: { competitionId },
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
      console.error('Erro ao buscar classificação da competição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateClassificationRequest = req.body;

      const classification = await prisma.classification.update({
        where: { id },
        data,
        include: {
          team: true,
          competition: true
        }
      });

      res.json(classification);
    } catch (error) {
      console.error('Erro ao atualizar classificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async recalculate(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;

      const competition = await prisma.competition.findUnique({
        where: { id: competitionId }
      });

      if (!competition) {
        return res.status(404).json({ error: 'Competição não encontrada' });
      }

      const completedMatches = await prisma.match.findMany({
        where: {
          competitionId,
          status: 'COMPLETED',
          homeScore: { not: null },
          awayScore: { not: null }
        }
      });

      await prisma.classification.updateMany({
        where: { competitionId },
        data: {
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          position: null
        }
      });

      for (const match of completedMatches) {
        await this.updateClassificationFromMatch(
          competitionId!,
          match.homeTeamId,
          match.awayTeamId,
          match.homeScore!,
          match.awayScore!
        );
      }

      await this.recalculatePositions(competitionId!);

      const updatedClassifications = await prisma.classification.findMany({
        where: { competitionId },
        include: {
          team: true
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ]
      });

      res.json({
        message: 'Classificação recalculada com sucesso',
        classifications: updatedClassifications
      });
    } catch (error) {
      console.error('Erro ao recalcular classificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStandings(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;

      const standings = await prisma.classification.findMany({
        where: { competitionId },
        include: {
          team: true
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ]
      });

      const formattedStandings = standings.map((standing: any, index: number) => ({
        position: index + 1,
        team: {
          id: standing.team.id,
          name: standing.team.name,
          institution: standing.team.institution
        },
        points: standing.points,
        matches: standing.wins + standing.draws + standing.losses,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDifference: standing.goalDifference
      }));

      res.json({
        competitionId,
        standings: formattedStandings,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao buscar tabela de classificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  private async updateClassificationFromMatch(
    competitionId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number
  ) {
    // Buscar ou criar classificações
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
