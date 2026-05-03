import { pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 255 }),
  picture: text("picture"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const savedGames = pgTable("saved_games", {
  id: uuid("id").primaryKey().defaultRandom(),
  fen: text("fen").notNull(),
  pgn: text("pgn").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedGame = typeof savedGames.$inferSelect;
export type NewSavedGame = typeof savedGames.$inferInsert;
