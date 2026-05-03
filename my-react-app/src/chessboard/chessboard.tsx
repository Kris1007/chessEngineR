import { useEffect } from "react";
import type { GameStatus } from "../App";

type Props = {
  setPgn: (pgn: string) => void;
  setFen: (fen: string) => void;
  setStatus: (status: GameStatus) => void;
  onSaveGame: (fen: string, pgn: string) => void;
  initialFen?: string;
  initialPgn?: string;
};

declare global {
  interface Window {
    updateReactState?: (pgn: string, fen: string, status: GameStatus) => void;
    saveCurrentGame?: (fen: string, pgn: string) => void;
  }
}

export default function Chessboard({ setPgn, setFen, setStatus, onSaveGame, initialFen, initialPgn }: Props) {
  useEffect(() => {
    window.updateReactState = (nextPgn, nextFen, nextStatus) => {
      setPgn(nextPgn);
      setFen(nextFen);
      setStatus(nextStatus);
    };
    window.saveCurrentGame = onSaveGame;

    return () => {
      delete window.updateReactState;
      delete window.saveCurrentGame;
    };
  }, [setPgn, setFen, setStatus, onSaveGame]);

  useEffect(() => {
    if (!initialFen) return;

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Chessboard"]');
    const loadGame = () => {
      const iframeWindow = iframe?.contentWindow as (Window & {
        loadGameFromReact?: (fen: string, pgn?: string) => boolean;
      }) | null;

      iframeWindow?.loadGameFromReact?.(initialFen, initialPgn);
    };

    iframe?.addEventListener("load", loadGame);
    loadGame();

    return () => {
      iframe?.removeEventListener("load", loadGame);
    };
  }, [initialFen, initialPgn]);

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
