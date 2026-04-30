type Props = {
  setPgn: (pgn: string) => void;
  setIsCheck: (check: boolean) => void;
};

export default function Chessboard({ setPgn, setIsCheck }: Props) {
  return (
    <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
    }}>
        <iframe
        src="/chessboard/index.html"
        title="Chessboard"
        style={{ width: "420px", height: "460px", border: "none" }}
        />
    </div>
  )
}