import { useState } from "react";
import Chessboard from "./chessboard/chessboard";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";

export default function App() {
  const [pgn, setPgn] = useState("");
  const [isCheck, setIsCheck] = useState(false);

  return (
    <div style={{ backgroundColor: "#FFE5B4"}}>
      
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 3 }}>
          <Chessboard setPgn={setPgn} setIsCheck={setIsCheck} />
        </div>
        <div style={{ flex: 1 }}>
          <SidePanel pgn={pgn} isCheck={isCheck} />
        </div>
      </div>

      <Footer />
    </div>
  );
}