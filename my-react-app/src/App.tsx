import Chessboard from "./chessboard/chessboard"
import Header from "./Header"
import Footer from "./Footer"

function App() {
  return (
    <>
    <div style={{ backgroundColor: "#FFE5B4" }}>
    <Header />
    <Chessboard />
    <Footer />
    </div>
    </>
  )
}

export default App;