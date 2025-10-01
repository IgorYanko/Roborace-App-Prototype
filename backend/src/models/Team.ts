import { prisma } from '../lib/prisma.ts';
import type { Team } from '@prisma/client';

export type TeamCreateInput = {
  name: string;
  institution: string;
  competitionId: number;
};

export type TeamUpdateInput = {
  name?: string;
  institution?: string;
};

export class TeamModel {
  static async create(data: TeamCreateInput): Promise<Team> {
    return await prisma.team.create({
      data: {
        name: data.name,
        institution: data.institution,
        competitionId: data.competitionId,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      },
    });
  }

  static async findByCompetitionId(competitionId: number): Promise<Team[]> {
    return await prisma.team.findMany({
      where: { competitionId },
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
      ],
    });
  }

  static async findById(id: number): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { id },
    });
  }

  static async updateStats(id: number, result: 'win' | 'draw' | 'loss'): Promise<Team | null> {
    try {
      const team = await prisma.team.findUnique({ where: { id } });
      if (!team) return null;

      const updateData: any = {};
      
      switch (result) {
        case 'win':
          updateData.wins = { increment: 1 };
          updateData.points = { increment: 2 };
          break;
        case 'draw':
          updateData.draws = { increment: 1 };
          updateData.points = { increment: 1 };
          break;
        case 'loss':
          updateData.losses = { increment: 1 };
          break;
      }

      return await prisma.team.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.team.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
