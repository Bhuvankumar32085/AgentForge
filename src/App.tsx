import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/auth/Login'
import { Home } from './pages/Home'
import { Integrations } from './pages/Integrations'
import { Dashboard } from './pages/Dashboard'
import { AgentChat } from './pages/AgentChat'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { Toaster } from './components/ui/sonner'
import { useGetMe } from './hooks/useGetMe'

function AppRoutes() {
  useGetMe();

  return (
    <Routes>
      {/* Public Home Page - Accessible by everyone (logged in or logged out) */}
      <Route path="/" element={<Home />} />

      {/* Protected Routes - Only accessible if user is logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents/:id/chat" element={<AgentChat />} />
        <Route path="/integrations" element={<Integrations />} />
      </Route>

      {/* Public Only Routes - Logged in user cannot access /login, gets redirected to / */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App
