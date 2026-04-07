export interface BoardData {
  id: string;
  name: string;
  defaultUsername: string;
  description: string | null;
  coverImage: string | null;
  userId: string | null;
  deleted: boolean;
  maxResponsesPerThread: number;
  blockForeignIp: boolean;
  writeLocked: boolean;
  responsesPerPage: number;
  showUserCount: boolean;
  threadsPerPage: number;
  uploadMaxSize: number;
  uploadMimeTypes: string;
  threadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBoardInput {
  id: string;
  name: string;
  defaultUsername: string;
  description?: string;
  coverImage?: string;
  userId?: string;
  maxResponsesPerThread?: number;
  blockForeignIp?: boolean;
  writeLocked?: boolean;
  responsesPerPage?: number;
  showUserCount?: boolean;
  threadsPerPage?: number;
  uploadMaxSize?: number;
  uploadMimeTypes?: string;
}

export interface UpdateBoardInput {
  name?: string;
  defaultUsername?: string;
  description?: string | null;
  coverImage?: string | null;
  userId?: string | null;
  deleted?: boolean;
  maxResponsesPerThread?: number;
  blockForeignIp?: boolean;
  writeLocked?: boolean;
  responsesPerPage?: number;
  showUserCount?: boolean;
  threadsPerPage?: number;
  uploadMaxSize?: number;
  uploadMimeTypes?: string;
}

export interface ConfigBoardInput {
  defaultUsername?: string;
  maxResponsesPerThread?: number;
  blockForeignIp?: boolean;
  writeLocked?: boolean;
  responsesPerPage?: number;
  showUserCount?: boolean;
  threadsPerPage?: number;
}

export type BoardWithThreadCount = BoardData;

export interface BoardRepository {
  findAll(): Promise<BoardData[]>;
  findAllWithThreadCount(): Promise<BoardWithThreadCount[]>;
  findById(id: string): Promise<BoardData | null>;
  create(data: CreateBoardInput): Promise<BoardData>;
  update(id: string, data: UpdateBoardInput): Promise<BoardData>;
  updateConfig(id: string, data: ConfigBoardInput): Promise<BoardData>;
  findByUserId(userId: string): Promise<BoardData[]>;
}
