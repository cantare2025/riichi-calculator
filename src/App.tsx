import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Rules } from "@/pages/Rules";

export default function App() {
  return (
    <Router basename="/riichi-calculator">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </Router>
  );
}