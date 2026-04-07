const fs = require('fs');

// 1. Rewrite schema.prisma
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
schema = schema.replace(/@db\.\w+/g, ''); // Remove @db.Text and similar PostgreSQL types
schema = schema.replace(/@@index.*Gin.*\n?/g, ''); // Remove Gin indexes
schema = schema.replace(/\(ops: raw\("gin_trgm_ops"\)\)/g, ''); // Clean up raw ops
fs.writeFileSync('prisma/schema.prisma', schema);

// 2. Rewrite lib/prisma.ts
const prismaTs = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
fs.writeFileSync('lib/prisma.ts', prismaTs);

// 3. Create basic .env
fs.writeFileSync('.env', `DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=this-is-a-placeholder-secret-key-for-development
`);

console.log('Conversion to SQLite complete.');
