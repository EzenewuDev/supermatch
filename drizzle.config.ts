import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "file:./local.db";

// Use turso dialect if it's a remote turso database, otherwise use sqlite for local file
const isTurso = connectionString.startsWith("libsql://") || connectionString.startsWith("https://");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: {
    url: connectionString,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
