import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home";
import History from "./History";
import Login from "./Login";
import Signup from "./Signup";

export type GameStatus = {
  inCheck: boolean;
  checkColor: "White" | "Black" | null;
  inCheckmate: boolean;
  checkmateColor: "White" | "Black" | null;
  inDraw: boolean;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user/logout" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
