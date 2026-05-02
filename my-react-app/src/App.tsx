import { useEffect } from "react";
import { googleLogout } from "@react-oauth/google";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home";
import History from "./History";
import Login from "./Login";
import Signup from "./Signup";
import { clearStoredUser } from "./auth";

export type GameStatus = {
  inCheck: boolean;
  checkColor: "White" | "Black" | null;
  inCheckmate: boolean;
  checkmateColor: "White" | "Black" | null;
  inDraw: boolean;
};

export type TopMove = {
  move: string;
  eval: string;
};

function Logout() {
  useEffect(() => {
    clearStoredUser();
    googleLogout();
  }, []);

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
