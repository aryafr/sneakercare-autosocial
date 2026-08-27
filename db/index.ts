import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const getDbUrl = () => {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return "file:/tmp/local.db";
  }
  return "file:local.db";
};

const url = getDbUrl();
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
