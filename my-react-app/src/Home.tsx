import { useState } from "react";
import Chessboard from "./chessboard/chessboard";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";
import type { GameStatus } from "./App";

const initialStatus: GameStatus = {
  inCheck: false,
  checkColor: null,
  inCheckmate: false,
  checkmateColor: null,
  inDraw: false,
};

export default function Home() {
  const [pgn, setPgn] = useState("");
  const [status, setStatus] = useState<GameStatus>(initialStatus);

  return (
    <div className="home-page">
      <Header />
      <div className="home-game-layout">
        <div className="home-board-column">
          <Chessboard setPgn={setPgn} setStatus={setStatus} />
        </div>
        <div className="home-side-panel-column">
          <SidePanel pgn={pgn} status={status} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
