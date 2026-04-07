import { prisma } from "@/lib/prisma";
import {
  BoardRepository,
  BoardData,
  BoardWithThreadCount,
  CreateBoardInput,
  UpdateBoardInput,
  ConfigBoardInput,
} from "@/lib/repositories/interfaces/board";

export const boardRepository: BoardRepository = {
  async findAll(): Promise<BoardData[]> {
    return (prisma.board as any).findMany({
      where: { deleted: false },
      orderBy: { createdAt: "asc" },
    });
  },

  async findAllWithThreadCount(): Promise<BoardWithThreadCount[]> {
    return (prisma.board as any).findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string): Promise<BoardData | null> {
    return (prisma.board as any).findUnique({ where: { id } });
  },

  async create(data: CreateBoardInput): Promise<BoardData> {
    return (prisma.board as any).create({
      data: {
        id: data.id,
        name: data.name,
        defaultUsername: data.defaultUsername,
        description: data.description ?? null,
        coverImage: data.coverImage ?? null,
        userId: data.userId ?? null,
        maxResponsesPerThread: data.maxResponsesPerThread,
        blockForeignIp: data.blockForeignIp,
        writeLocked: data.writeLocked,
        responsesPerPage: data.responsesPerPage,
        showUserCount: data.showUserCount,
        threadsPerPage: data.threadsPerPage,
        uploadMaxSize: data.uploadMaxSize,
        uploadMimeTypes: data.uploadMimeTypes,
      },
    });
  },

  async update(id: string, data: UpdateBoardInput): Promise<BoardData> {
    return (prisma.board as any).update({
      where: { id },
      data: {
        name: data.name,
        defaultUsername: data.defaultUsername,
        description: data.description,
        coverImage: data.coverImage,
        userId: data.userId,
        deleted: data.deleted,
        maxResponsesPerThread: data.maxResponsesPerThread,
        blockForeignIp: data.blockForeignIp,
        writeLocked: data.writeLocked,
        responsesPerPage: data.responsesPerPage,
        showUserCount: data.showUserCount,
        threadsPerPage: data.threadsPerPage,
        uploadMaxSize: data.uploadMaxSize,
        uploadMimeTypes: data.uploadMimeTypes,
      },
    });
  },

  async updateConfig(id: string, data: ConfigBoardInput): Promise<BoardData> {
    return (prisma.board as any).update({ where: { id }, data });
  },

  async findByUserId(userId: string): Promise<BoardData[]> {
    return (prisma.board as any).findMany({
      where: { userId, deleted: false },
      orderBy: { updatedAt: "desc" },
    });
  },
};
