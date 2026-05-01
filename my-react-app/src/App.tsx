import { useState } from "react";
import Chessboard from "./chessboard/chessboard";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";

export type GameStatus = {
  inCheck: boolean;
  checkColor: "White" | "Black" | null;
  inCheckmate: boolean;
  checkmateColor: "White" | "Black" | null;
  inDraw: boolean;
};

const initialStatus: GameStatus = {
  inCheck: false,
  checkColor: null,
  inCheckmate: false,
  checkmateColor: null,
  inDraw: false,
};

export default function App() {
  const [pgn, setPgn] = useState("");
  const [status, setStatus] = useState<GameStatus>(initialStatus);

  return (
    <div className="app-shell">
      
      <Header />
      <div className="game-layout">
        <div className="board-column">
          <Chessboard setPgn={setPgn} setStatus={setStatus} />
        </div>
        <div className="side-panel-column">
          <SidePanel pgn={pgn} status={status} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
