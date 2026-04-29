function Chessboard() {
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

export default Chessboard