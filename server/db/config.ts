import process from "node:process";

export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.PGUSER ?? process.env.POSTGRES_USER ?? process.env.USER;
  const host = process.env.PGHOST ?? process.env.HOST;
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DB ?? process.env.DATABASE;
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? process.env.PASSWORD;
  const port = process.env.PGPORT ?? process.env.PORT ?? "5432";

  if (!user || !host || !database || !password) {
    throw new Error(
      "Database configuration is missing. Set DATABASE_URL or USER, HOST, DATABASE, PASSWORD, and PORT."
    );
  }

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}
