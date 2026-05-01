import { useEffect } from "react";
import type { GameStatus } from "../App";

type Props = {
  setPgn: (pgn: string) => void;
  setFen: (fen: string) => void;
  setStatus: (status: GameStatus) => void;
};

declare global {
  interface Window {
    updateReactState?: (pgn: string, fen: string, status: GameStatus) => void;
  }
}

export default function Chessboard({ setPgn, setFen, setStatus }: Props) {
  useEffect(() => {
    window.updateReactState = (nextPgn, nextFen, nextStatus) => {
      setPgn(nextPgn);
      setFen(nextFen);
      setStatus(nextStatus);
    };

    return () => {
      delete window.updateReactState;
    };
  }, [setPgn, setFen, setStatus]);

  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <iframe
        src="/chessboard/index.html"
        title="Chessboard"
        style={{ width: "420px", height: "460px", border: "none" }}
        />
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button id="flipOrientationBtn" style={{backgroundColor: "#FFB090", borderColor: "#FFB090"}}>Flip Orientation</button>
          <button id="setStartBtn" style={{backgroundColor: "#FFB090", borderColor: "#FFB090"}}>Start Position</button>
          <button id="saveButton" style={{backgroundColor: "#FFB090", borderColor: "#FFB090"}}>Save</button>
          <button id="copyFen" style={{backgroundColor: "#FFB090", borderColor: "#FFB090"}}>&#128203; FEN</button>
        </div>
    </div>
  )
}
