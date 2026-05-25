import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "";

  if (dbUrl.startsWith("postgres")) {
    // Production: PostgreSQL via @prisma/adapter-pg
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // Local dev: SQLite via @libsql/client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@libsql/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");
  const filePath = dbUrl.replace(/^file:/, "") || "./prisma/dev.db";
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const libsql = createClient({ url: `file:${absolutePath}` });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
