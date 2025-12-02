import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Reservas from "@/pages/Reservas";
import Carros from "@/pages/Carros";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/carros" element={<Carros />} />
      </Routes>
    </Router>
  );
}