import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const client = createClient({ 
      url: env.databaseUrl,
      ...(env.databaseAuthToken ? { authToken: env.databaseAuthToken } : {})
    });
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
