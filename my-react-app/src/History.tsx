import Header from "./Header";
import Footer from "./Footer";

export default function History() {
  return (
    <div style={{ backgroundColor: "#FFE5B4", minHeight: "100vh" }}>
      <Header />
      <main style={{ padding: "24px" }}>
        <h1>History</h1>
        <p>Your history content will appear here.</p>
      </main>
      <Footer />
    </div>
  );
}
