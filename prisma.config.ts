import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: dbUrl.startsWith("postgres") ? "prisma/schema.prod.prisma" : "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: dbUrl || "file:./prisma/dev.db",
  },
});
