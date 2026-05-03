import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./server/db/config";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
