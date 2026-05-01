import { Hono } from "hono";
import { cors } from "hono/cors";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const app = new Hono();

app.use("*", cors());

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
