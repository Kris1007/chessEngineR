import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

type SavedGame = {
  id: string;
  gameNumber: number;
  fen: string;
  pgn: string;
  createdAt: string;
};

const pieceCodes: Record<string, string> = {
  K: "wK",
  Q: "wQ",
  R: "wR",
  B: "wB",
  N: "wN",
  P: "wP",
  k: "bK",
  q: "bQ",
  r: "bR",
  b: "bB",
  n: "bN",
  p: "bP",
};

function fenToSquares(fen: string) {
  const board = fen.split(" ")[0] ?? "";

  return board.split("/").flatMap((rank) =>
    rank.split("").flatMap((char) => {
      const emptySquares = Number(char);

      if (!Number.isNaN(emptySquares)) {
        return Array<string>(emptySquares).fill("");
      }

      return pieceCodes[char] ?? "";
    })
  );
}

function FenBoard({ fen }: { fen: string }) {
  const squares = fenToSquares(fen);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gridTemplateRows: "repeat(8, 1fr)",
        width: 200,
        height: 200,
        border: "3px solid #404040",
        overflow: "hidden",
      }}
    >
      {squares.map((piece, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isLight = (row + col) % 2 === 0;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isLight ? "#f0d9b5" : "#b58863",
            }}
          >
            {piece && (
              <img
                src={`/chessboard/img/chesspieces/wikipedia/${piece}.png`}
                alt=""
                style={{ width: "86%", height: "86%", objectFit: "contain" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function loadSavedGames() {
      try {
        const response = await fetch("/api/saved-games");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load saved games.");
        }

        setGames(data.games ?? []);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load saved games.");
      } finally {
        setLoading(false);
      }
    }

    loadSavedGames();
  }, []);

  const openSavedGame = (fen: string, pgn: string) => {
    navigate("/home", { state: { fen, pgn } });
  };

  const deleteSavedGame = async (gameId: string) => {
    setDeletingId(gameId);
    setError("");

    try {
      const response = await fetch(`/api/saved-games/${gameId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete saved game.");
      }

      setGames((currentGames) => currentGames.filter((game) => game.id !== gameId));
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete saved game.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div style={{ backgroundColor: "#FFE5B4", minHeight: "100vh" }}>
      <Header />
      <main style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>History</h1>

        {loading && <p style={{ textAlign: "center" }}>Loading saved games...</p>}
        {error && <p style={{ textAlign: "center", color: "#8A1F11" }}>{error}</p>}
        {!loading && !error && games.length === 0 && (
          <p style={{ textAlign: "center" }}>No saved games yet.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 320px)",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {games.map((game) => (
            <section
              key={game.id}
              onClick={() => openSavedGame(game.fen, game.pgn)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openSavedGame(game.fen, game.pgn);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: 16,
                backgroundColor: "#FFB090",
                border: "1px solid rgba(122, 74, 53, 0.28)",
                borderRadius: 8,
                cursor: "pointer",
                aspectRatio: "1",
                overflow: "hidden"
              }}
            >
              <div style={{ fontWeight: 700 }}>{new Date(game.createdAt).toLocaleString()}</div>
              <FenBoard fen={game.fen} />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteSavedGame(game.id);
                }}
                disabled={deletingId === game.id}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  color: "#2F241F",
                  fontWeight: 600,
                  backgroundColor: "#FFE5B4",
                  border: "1px solid rgba(122, 74, 53, 0.35)",
                  borderRadius: 6,
                  cursor: deletingId === game.id ? "not-allowed" : "pointer",
                }}
              >
                {deletingId === game.id ? "Deleting..." : "Delete Game"}
              </button>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
