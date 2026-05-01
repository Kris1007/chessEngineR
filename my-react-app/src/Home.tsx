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
    <div style={{ backgroundColor: "#FFE5B4" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 3 }}>
          <Chessboard setPgn={setPgn} setStatus={setStatus} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <SidePanel pgn={pgn} status={status} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
