import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign } from "hono/jwt";
import { OAuth2Client } from "google-auth-library";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { db } from "./db";
import { savedGames, users } from "./db/schema";
import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const app = new Hono();
const googleClient = new OAuth2Client();

app.use("*", cors());

function isDatabaseConnectionError(error: unknown) {
  const messages: string[] = [];
  let current: unknown = error;

  while (current instanceof Error) {
    messages.push(current.message);
    current = current.cause;
  }

  return messages.some(
    (message) =>
      message.includes("password authentication failed") ||
      message.includes("DATABASE_URL") ||
      message.includes("Database configuration is missing") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND")
  );
}

app.post("/api/auth/signup", async (c) => {
  const { email, password, name } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: name || email.split("@")[0],
      })
      .returning();

    const secret = process.env.JWT_SECRET || process.env.SECRET || "super-secret-development-key";
    const token = await sign({ id: newUser.id, email: newUser.email }, secret);

    return c.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        picture: newUser.picture,
      },
    });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Signup failed" }, 500);
  }
});

app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const secret = process.env.JWT_SECRET || process.env.SECRET || "super-secret-development-key";
    const token = await sign({ id: user.id, email: user.email }, secret);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Login failed" }, 500);
  }
});

app.post("/api/auth/google", async (c) => {
  const { credential } = await c.req.json();
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return c.json({ error: "GOOGLE_CLIENT_ID is not configured" }, 500);
  }

  if (!credential) {
    return c.json({ error: "Google credential is required" }, 400);
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      return c.json({ error: "Invalid Google account payload" }, 401);
    }

    let user = await db.query.users.findFirst({
      where: eq(users.email, payload.email),
    });

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: payload.email,
          googleId: payload.sub,
          name: payload.name ?? payload.email,
          picture: payload.picture,
        })
        .returning();
    } else if (!user.googleId) {
      [user] = await db
        .update(users)
        .set({ googleId: payload.sub, picture: payload.picture || user.picture })
        .where(eq(users.id, user.id))
        .returning();
    }

    const secret = process.env.JWT_SECRET || process.env.SECRET || "super-secret-development-key";
    const token = await sign({ id: user.id, email: user.email }, secret);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Invalid Google credential" }, 401);
  }
});

app.post("/api/saved-games", async (c) => {
  const { fen, pgn } = await c.req.json();

  if (!fen || typeof fen !== "string") {
    return c.json({ error: "FEN is required" }, 400);
  }

  try {
    const [savedGame] = await db
      .insert(savedGames)
      .values({ fen, pgn: pgn || "" })
      .returning();

    return c.json({ savedGame }, 201);
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Could not save game" }, 500);
  }
});

app.get("/api/saved-games", async (c) => {
  try {
    const games = await db
      .select()
      .from(savedGames)
      .orderBy(desc(savedGames.createdAt));

    return c.json({ games });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Could not load saved games" }, 500);
  }
});

app.delete("/api/saved-games/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [deletedGame] = await db
      .delete(savedGames)
      .where(eq(savedGames.id, id))
      .returning();

    if (!deletedGame) {
      return c.json({ error: "Saved game not found" }, 404);
    }

    return c.json({ deletedGame });
  } catch (error) {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
      return c.json({ error: "Database connection failed. Check the Postgres values in the root .env file." }, 500);
    }
    return c.json({ error: "Could not delete saved game" }, 500);
  }
});

app.post("/api/analyze", async (c) => {
  const { fen } = await c.req.json();

  if (!fen) {
    return c.json({ error: "FEN is required" }, 400);
  }

  return new Promise<Response>((resolve, reject) => {
    const enginePath = path.join(
      process.cwd(),
      "node_modules",
      "stockfish",
      "bin",
      "stockfish-18-asm.js"
    );
    const engine = spawn("node", [enginePath]);
    const temp: Record<number, { move: string; eval: string }> = {};

    engine.stdout.on("data", (data: Uint8Array) => {
      const lines = data.toString().split("\n");

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line.includes("multipv")) {
          const moveMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
          const evalMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          const multipvMatch = line.match(/multipv (\d+)/);

          if (multipvMatch && moveMatch) {
            const index = Number(multipvMatch[1]);

            let evalValue = "";

            if (mateMatch) {
              evalValue = `Mate in ${mateMatch[1]}`;
            } else if (evalMatch) {
              evalValue = (Number(evalMatch[1]) / 100).toFixed(2);
            }

            temp[index] = {
              move: moveMatch[1],
              eval: evalValue,
            };
          }
        }

        if (line.includes("bestmove")) {
          const moves = [temp[1], temp[2], temp[3]].filter(Boolean);

          engine.kill();

          resolve(
            c.json({
              moves,
            })
          );
        }
      }
    });

    engine.on("error", (error) => {
      reject(error);
    });

    engine.stdin.write("uci\n");
    engine.stdin.write("setoption name MultiPV value 3\n");
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write("go movetime 1500\n");
  });
});

export default app;
