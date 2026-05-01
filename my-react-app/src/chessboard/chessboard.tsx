import { useEffect } from "react";
import type { GameStatus } from "../App";

type Props = {
  setPgn: (pgn: string) => void;
  setStatus: (status: GameStatus) => void;
};

declare global {
  interface Window {
    updateReactState?: (pgn: string, status: GameStatus) => void;
  }
}

export default function Chessboard({ setPgn, setStatus }: Props) {
  useEffect(() => {
    window.updateReactState = (nextPgn, nextStatus) => {
      setPgn(nextPgn);
      setStatus(nextStatus);
    };

    return () => {
      delete window.updateReactState;
    };
  }, [setPgn, setStatus]);

  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
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
