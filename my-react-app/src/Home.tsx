import { useEffect, useState } from "react";
import Chessboard from "./chessboard/chessboard";
import ProgressBar from "react-bootstrap/ProgressBar";
import Header from "./Header";
import Footer from "./Footer";
import SidePanel from "./SidePanel";
import CameraTracker from "./CameraTracker";
import type { GameStatus, TopMove } from "./App";
import { useLocation, useNavigate } from "react-router-dom";

const initialStatus: GameStatus = {
  inCheck: false,
  checkColor: null,
  inCheckmate: false,
  checkmateColor: null,
  inDraw: false,
};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { fen?: string; pgn?: string } | null;
  const savedFen = state?.fen;
  const savedPgn = state?.pgn;
  const [pgn, setPgn] = useState("");

  const handleMoveDetected = (squares: string[]) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow && (iframe.contentWindow as any).makeMoveFromReact) {
      const makeMove = (iframe.contentWindow as any).makeMoveFromReact;
      // Try every possible pair of changed squares until one is a legal chess move
      for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares.length; j++) {
          if (i !== j) {
            if (makeMove(squares[i], squares[j])) {
              console.log(`Successfully moved ${squares[i]} to ${squares[j]}`);
              return;
            }
          }
        }
      }
    }
  };

  const handleClearState = () => {
    navigate(location.pathname, { replace: true, state: {} });
  };

  const [fen, setFen] = useState("");
  const [status, setStatus] = useState<GameStatus>(initialStatus);
  const [topMoves, setTopMoves] = useState<TopMove[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveGame = async (fenToSave: string, pgnToSave: string) => {
    setSaveMessage("");

    try {
      const response = await fetch("/api/saved-games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fen: fenToSave, pgn: pgnToSave }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save game.");
      }

      setSaveMessage("Game saved successfully.");
    } catch (error) {
      console.error(error);
      setSaveMessage(error instanceof Error ? error.message : "Could not save game.");
    }
  };

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
        <div className="home-board-column" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <ProgressBar style={{ width: "420px", marginTop: "10px" }}>
            <ProgressBar
              style={{ backgroundColor: "#FFB090" }}
              now={(() => {
                if (status.inCheckmate) {
                  return status.checkmateColor === "White" ? 0 : 100;
                }
                if (status.inDraw) return 50;
                if (!topMoves.length || !topMoves[0].eval) return 50;
                const evalStr = String(topMoves[0].eval).trim();
                if (evalStr.includes('M') || evalStr.includes('#')) {
                  return evalStr.startsWith('-') ? 0 : 100;
                }
                const val = parseFloat(evalStr);
                if (isNaN(val)) return 50;
                return Math.max(0, Math.min(100, 50 + val * 10));
              })()} 
            />
          </ProgressBar>
          <Chessboard
            setPgn={setPgn}
            setFen={setFen}
            setStatus={setStatus}
            onSaveGame={handleSaveGame}
            onClearState={handleClearState}
            initialFen={savedFen}
            initialPgn={savedPgn}
          />
          {saveMessage && (
            <div style={{ color: "#4B2E24", fontWeight: 600 }}>{saveMessage}</div>
          )}
        </div>
        <div className="home-side-panel-column">
          <SidePanel pgn={pgn} status={status} topMoves={topMoves} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CameraTracker onMoveDetected={handleMoveDetected} />
      </div>
      <Footer />
    </div>
  );
}
