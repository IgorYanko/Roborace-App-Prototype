import { prisma } from '../lib/prisma.ts';
import type { Match } from '@prisma/client';

export type MatchCreateInput = {
  team1Id: number;
  team2Id: number;
  competitionId: number;
  result?: 'team1_win' | 'team2_win' | 'draw' | null;
  phase: 'group' | 'semifinal' | 'third_place' | 'final';
  matchDate?: Date | null;
};

export class MatchModel {
  static async create(data: MatchCreateInput): Promise<Match> {
    return await prisma.match.create({
      data: {
        team1Id: data.team1Id,
        team2Id: data.team2Id,
        competitionId: data.competitionId,
        result: data.result || null,
        phase: data.phase,
        matchDate: data.matchDate || null,
      },
    });
  }

  static async findByCompetitionId(competitionId: number): Promise<Match[]> {
    return await prisma.match.findMany({
      where: { competitionId },
      orderBy: [
        { phase: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  static async findByPhase(competitionId: number, phase: string): Promise<Match[]> {
    return await prisma.match.findMany({
      where: { 
        competitionId,
        phase: phase as 'group' | 'semifinal' | 'third_place' | 'final'
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async findById(id: number): Promise<Match | null> {
    return await prisma.match.findUnique({
      where: { id },
    });
  }

  static async updateResult(id: number, result: 'team1_win' | 'team2_win' | 'draw'): Promise<Match | null> {
    try {
      return await prisma.match.update({
        where: { id },
        data: { result },
      });
    } catch (error) {
      return null;
    }
  }

  static async generateGroupMatches(competitionId: number, teamIds: number[]): Promise<Match[]> {
    const matches: Match[] = [];
    
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        const match = await this.create({
          team1Id: teamIds[i]!,
          team2Id: teamIds[j]!,
          competitionId,
          result: null,
          phase: 'group',
          matchDate: null
        });
        matches.push(match);
      }
    }
    
    return matches;
  }

  static async generateSemifinals(competitionId: number, top4Teams: number[]): Promise<Match[]> {
    const matches: Match[] = [];
    
    const semifinal1 = await this.create({
      team1Id: top4Teams[0]!,
      team2Id: top4Teams[3]!,
      competitionId,
      result: null,
      phase: 'semifinal',
      matchDate: null
    });
    matches.push(semifinal1);

    const semifinal2 = await this.create({
      team1Id: top4Teams[1]!,
      team2Id: top4Teams[2]!,
      competitionId,
      result: null,
      phase: 'semifinal',
      matchDate: null
    });
    matches.push(semifinal2);

    return matches;
  }

  static async generateThirdPlaceAndFinal(competitionId: number, semifinalWinners: number[], semifinalLosers: number[]): Promise<Match[]> {
    const matches: Match[] = [];
    
    const thirdPlace = await this.create({
      team1Id: semifinalLosers[0]!,
      team2Id: semifinalLosers[1]!,
      competitionId,
      result: null,
      phase: 'third_place',
      matchDate: null
    });
    matches.push(thirdPlace);

    const final = await this.create({
      team1Id: semifinalWinners[0]!,
      team2Id: semifinalWinners[1]!,
      competitionId,
      result: null,
      phase: 'final',
      matchDate: null
    });
    matches.push(final);

    return matches;
  }
}
