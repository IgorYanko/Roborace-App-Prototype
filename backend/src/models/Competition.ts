import { prisma } from '../lib/prisma.js';
import type { Competition } from '@prisma/client';

export type CompetitionCreateInput = {
  name: string;
  maxTeams: number;
  maxPlayersPerTeam: number;
};

export type CompetitionUpdateInput = {
  name?: string;
  maxTeams?: number;
  maxPlayersPerTeam?: number;
};

export class CompetitionModel {
  static async create(data: CompetitionCreateInput): Promise<Competition> {
    return await prisma.competition.create({
      data: {
        name: data.name,
        maxTeams: data.maxTeams,
        maxPlayersPerTeam: data.maxPlayersPerTeam,
      },
    });
  }

  static async findAll(): Promise<Competition[]> {
    return await prisma.competition.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: number): Promise<Competition | null> {
    return await prisma.competition.findUnique({
      where: { id },
    });
  }

  static async update(id: number, data: CompetitionUpdateInput): Promise<Competition | null> {
    try {
      return await prisma.competition.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.competition.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
