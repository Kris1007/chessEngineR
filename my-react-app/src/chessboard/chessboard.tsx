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
    <div className="chessboard-panel">
        <iframe
        src="/chessboard/index.html"
        title="Chessboard"
        className="chessboard-frame"
        />
        <div className="board-actions">
        <button id="flipOrientationBtn" className="board-action-button">Flip Orientation</button>
        <button id="setStartBtn" className="board-action-button">Start Position</button>
        <button id="saveButton" className="board-action-button">Save</button>
        <button id="copyFen" className="board-action-button">&#128203; FEN</button>
        </div>
    </div>
  )
}
