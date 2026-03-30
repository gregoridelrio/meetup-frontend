import { BrowserRouter, Routes, Route } from "react-router-dom";
import MatchesIndex from "./pages/MatchesIndex";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MatchesIndex />} />
      </Routes>
    </BrowserRouter>
  );
}