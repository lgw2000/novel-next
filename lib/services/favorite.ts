import { prisma } from "@/lib/prisma";
import { invalidateCache, CACHE_TAGS } from "@/lib/cache";

export class FavoriteService {
  async toggleBoardFavorite(userId: string, boardId: string) {
    const existing: any[] = await prisma.$queryRaw`
      SELECT * FROM UserFavoriteBoard WHERE userId = ${userId} AND boardId = ${boardId}
    `;

    if (existing && existing.length > 0) {
      await prisma.$executeRaw`
        DELETE FROM UserFavoriteBoard WHERE userId = ${userId} AND boardId = ${boardId}
      `;
      return { favorited: false };
    } else {
      await prisma.$executeRaw`
        INSERT INTO UserFavoriteBoard (userId, boardId, createdAt) 
        VALUES (${userId}, ${boardId}, ${new Date().toISOString()})
      `;
      return { favorited: true };
    }
  }

  async toggleAuthorFavorite(followerId: string, authorId: string) {
    const existing: any[] = await prisma.$queryRaw`
      SELECT * FROM UserFavoriteAuthor WHERE followerId = ${followerId} AND authorId = ${authorId}
    `;

    if (existing && existing.length > 0) {
      await prisma.$executeRaw`
        DELETE FROM UserFavoriteAuthor WHERE followerId = ${followerId} AND authorId = ${authorId}
      `;
      return { favorited: false };
    } else {
      await prisma.$executeRaw`
        INSERT INTO UserFavoriteAuthor (followerId, authorId, createdAt) 
        VALUES (${followerId}, ${authorId}, ${new Date().toISOString()})
      `;
      return { favorited: true };
    }
  }

  async isBoardFavorited(userId: string, boardId: string) {
    const fav: any[] = await prisma.$queryRaw`
      SELECT userId FROM UserFavoriteBoard WHERE userId = ${userId} AND boardId = ${boardId} LIMIT 1
    `;
    return fav && fav.length > 0;
  }

  async isAuthorFavorited(followerId: string, authorId: string) {
    const fav: any[] = await prisma.$queryRaw`
      SELECT authorId FROM UserFavoriteAuthor WHERE followerId = ${followerId} AND authorId = ${authorId} LIMIT 1
    `;
    return fav && fav.length > 0;
  }

  async getFavoriteBoards(userId: string) {
    const boards: any[] = await prisma.$queryRaw`
      SELECT b.*, 
             (SELECT count(*) FROM Thread t WHERE t.boardId = b.id AND t.published = 1 AND t.deleted = 0) as threadCount
      FROM Board b
      JOIN UserFavoriteBoard ufb ON b.id = ufb.boardId
      WHERE ufb.userId = ${userId} AND b.deleted = 0
      ORDER BY ufb.createdAt DESC
    `;
    
    return boards.map(b => ({
      board: {
        ...b,
        _count: { threads: b.threadCount }
      }
    }));
  }

  async getNovelsByFavoriteAuthors(userId: string) {
    const boards: any[] = await prisma.$queryRaw`
      SELECT b.*, 
             (SELECT count(*) FROM Thread t WHERE t.boardId = b.id AND t.published = 1 AND t.deleted = 0) as threadCount
      FROM Board b
      WHERE b.userId IN (SELECT authorId FROM UserFavoriteAuthor WHERE followerId = ${userId})
        AND b.deleted = 0
      ORDER BY b.updatedAt DESC
    `;

    return boards.map(b => ({
      ...b,
      _count: { threads: b.threadCount }
    }));
  }
}

export const favoriteService = new FavoriteService();
