import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import MatchesIndex from "./pages/MatchesIndex";
import MatchDetail from "./pages/MatchDetail";
import ProtectedRoute from "./router/ProtectedRoute";
import Navbar from "./components/Navbar";
import MatchCreate from "./pages/MatchCreate";
import MatchEdit from "./pages/MatchEdit";

// Layout con Navbar (para todas las páginas excepto auth)
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas auth — sin Navbar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas con Navbar */}
        <Route element={<AppLayout />}>
          {/* Públicas */}
          <Route path="/" element={<MatchesIndex />} />
          <Route path="/matches/:id" element={<MatchDetail />} />

          {/* Protegidas (añade aquí las que requieran auth:api) */}
          {<Route path="/matches/create" element={
            <ProtectedRoute><MatchCreate />
            </ProtectedRoute>

          } />}
          {<Route path="/matches/:id/edit" element={
            <ProtectedRoute><MatchEdit /></ProtectedRoute>
          } />}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}