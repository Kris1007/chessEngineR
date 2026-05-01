import { useEffect, useState } from "react";
import Chessboard from "./chessboard/chessboard";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";
import type { GameStatus, TopMove } from "./App";

const initialStatus: GameStatus = {
  inCheck: false,
  checkColor: null,
  inCheckmate: false,
  checkmateColor: null,
  inDraw: false,
};

export default function Home() {
  const [pgn, setPgn] = useState("");
  const [fen, setFen] = useState("");
  const [status, setStatus] = useState<GameStatus>(initialStatus);
  const [topMoves, setTopMoves] = useState<TopMove[]>([]);

  useEffect(() => {
    if (!fen) return;

    async function analyzePosition() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fen }),
        });

        const data = await response.json();
        setTopMoves(data.moves || []);
      } catch (error) {
        console.error(error);
        setTopMoves([]);
      }
    }

    analyzePosition();
  }, [fen]);

  return (
    <div className="home-page">
      <Header />
      <div className="home-game-layout">
        <div className="home-board-column">
          <Chessboard setPgn={setPgn} setFen={setFen} setStatus={setStatus} />
        </div>
        <div className="home-side-panel-column">
          <SidePanel pgn={pgn} status={status} topMoves={topMoves} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
