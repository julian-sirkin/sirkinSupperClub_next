import fs from "node:fs";
import crypto from "node:crypto";
import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const REQUIRED_ENV_KEYS = ["TURSO_CONNECTION_URL", "TURSO_AUTH_TOKEN"];
const missingEnv = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required env vars in .env.local: ${missingEnv.join(", ")}`);
}

const filesToBaseline = [
  "migrations/0000_unknown_jetstream.sql",
  "migrations/0001_add_dietary_restrictions.sql",
];

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hash text NOT NULL,
    created_at numeric
  )
`);

for (const file of filesToBaseline) {
  const sql = fs.readFileSync(file, "utf8");
  const hash = crypto.createHash("sha256").update(sql).digest("hex");

  const existing = await db.execute({
    sql: `SELECT 1 FROM "__drizzle_migrations" WHERE hash = ? LIMIT 1`,
    args: [hash],
  });

  if (existing.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?)`,
      args: [hash, Date.now()],
    });
    console.log(`Baselined ${file}`);
  } else {
    console.log(`Already baselined ${file}`);
  }
}

console.log("Baseline complete.");
