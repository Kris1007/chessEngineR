import React from "react";

type Props = {
  pgn: string;
  isCheck: boolean;
};

export default function SidePanel({ pgn, isCheck }: Props) {
  const moves = pgn
    .replace(/\d+\./g, "")
    .trim()
    .split(" ")
    .filter(Boolean);

  return (
    <div
      style={{
        width: "250px",
        borderLeft: "1px solid #ccc",
        padding: "10px",
        height: "100vh",
        overflowY: "auto",
        background: "#FFE5B4",
      }}
    >
      <h3>Moves</h3>

      {moves.length === 0 && <p>No moves yet</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {moves.map((move, index) => (
          <li key={index} style={{ padding: "4px 0" }}>
            <strong>{index + 1}.</strong> {move}
          </li>
        ))}
      </ul>

      {isCheck && (
        <div style={{ marginTop: "10px", color: "red" }}>
          ⚠ King is in check
        </div>
      )}
    </div>
  );
}