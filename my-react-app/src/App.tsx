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
    <div style={{ backgroundColor: "#FFE5B4"}}>
      
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
