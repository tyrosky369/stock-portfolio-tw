import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  let url: string;
  let authToken: string | undefined;

  if (process.env.TURSO_DATABASE_URL) {
    url = process.env.TURSO_DATABASE_URL;
    authToken = process.env.TURSO_AUTH_TOKEN;
  } else {
    const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
    const filePath = dbUrl.replace(/^file:/, "");
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    url = `file:${absolutePath}`;
  }

  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
