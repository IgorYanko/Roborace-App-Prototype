import { prisma } from '../lib/prisma.js';
import type { Player } from '@prisma/client';

export type PlayerCreateInput = {
  name: string;
  teamId: number;
};

export type PlayerUpdateInput = {
  name?: string;
  teamId?: number;
};

export class PlayerModel {
  static async create(data: PlayerCreateInput): Promise<Player> {
    return await prisma.player.create({
      data: {
        name: data.name,
        teamId: data.teamId,
      },
    });
  }

  static async findByTeamId(teamId: number): Promise<Player[]> {
    return await prisma.player.findMany({
      where: { teamId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async findById(id: number): Promise<Player | null> {
    return await prisma.player.findUnique({
      where: { id },
    });
  }

  static async update(id: number, data: PlayerUpdateInput): Promise<Player | null> {
    try {
      return await prisma.player.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.player.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
