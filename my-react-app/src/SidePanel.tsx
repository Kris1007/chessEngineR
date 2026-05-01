import type { GameStatus } from "./App";

type SidePanelProps = {
  pgn: string;
  status: GameStatus;
};

function formatMoveLines(pgn: string) {
  return pgn
    .trim()
    .split(/\s+/)
    .reduce<string[]>((lines, token) => {
      if (!token) return lines;

      if (/^\d+\.$/.test(token)) {
        lines.push(token);
        return lines;
      }

      if (lines.length === 0) {
        lines.push(token);
        return lines;
      }

      const lastLine = lines[lines.length - 1];
      if (/^\d+\.$/.test(lastLine)) {
        lines[lines.length - 1] = `${lastLine} ${token}`;
      } else {
        lines.push(token);
      }

      return lines;
    }, [])
    .join("\n");
}

export default function SidePanel({ pgn, status }: SidePanelProps) {
  const headline = status.inCheckmate
    ? `Checkmate - ${status.checkmateColor ?? "Unknown"} is in checkmate.`
    : status.inDraw
      ? "Draw."
      : status.inCheck
        ? `${status.checkColor ?? "Unknown"} king is in check.`
        : "No check.";
  const moveLines = formatMoveLines(pgn);

  return (
    <div
      style={{
        height: 460,
        width: 300,
        display: "flex",
        flexDirection: "column",
        padding: 14,
        backgroundColor: "#FFB090",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Game</div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{headline}</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>PGN</div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#F3F4F6",
          borderRadius: 8,
          padding: 10,
          flex: 1,
          overflow: "auto",
          margin: 0,
        }}
      >
        {moveLines || "(no moves yet)"}
      </pre>
    </div>
  );
}
