import "dotenv/config";
import { randomUUID } from "crypto";

const dbUrl = process.env.DATABASE_URL ?? "";

const MEMBERS = [
  { name: "Brian", sortOrder: 0 },
  { name: "Amber", sortOrder: 1 },
  { name: "Claire", sortOrder: 2 },
  { name: "Lucas", sortOrder: 3 },
];

async function seedPostgres() {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  for (const { name, sortOrder } of MEMBERS) {
    await client.query(
      `INSERT INTO members (id, name, "sortOrder", "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (name) DO NOTHING`,
      [randomUUID(), name, sortOrder]
    );
    console.log(`✓ ${name}`);
  }

  await client.end();
}

async function seedSQLite() {
  const { default: Database } = await import("better-sqlite3");
  const filePath = dbUrl.replace(/^file:/, "") || "./prisma/dev.db";
  const db = new Database(filePath);

  const insert = db.prepare(
    `INSERT OR IGNORE INTO members (id, name, sortOrder, createdAt)
     VALUES (?, ?, ?, datetime('now'))`
  );

  for (const { name, sortOrder } of MEMBERS) {
    insert.run(randomUUID(), name, sortOrder);
    console.log(`✓ ${name}`);
  }

  db.close();
}

async function main() {
  if (dbUrl.startsWith("postgres")) {
    await seedPostgres();
  } else {
    await seedSQLite();
  }
  console.log("Seeding complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
