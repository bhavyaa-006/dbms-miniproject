import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingSpinner from './components/LoadingSpinner'
import AppErrorBoundary from './components/AppErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LostItems from './pages/LostItems'
import ReportLost from './pages/ReportLost'
import FoundItems from './pages/FoundItems'
import ReportFound from './pages/ReportFound'
import Claims from './pages/Claims'
import MyClaims from './pages/MyClaims'
import Notifications from './pages/Notifications'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AppErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center p-6 text-zinc-200">The app hit an unexpected error. Please refresh the page.</div>}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Guest routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/lost-items"   element={<LostItems />} />
                <Route path="/report-lost"  element={<ReportLost />} />
                <Route path="/found-items"  element={<FoundItems />} />
                <Route path="/report-found" element={<ReportFound />} />
                <Route path="/my-claims"    element={<MyClaims />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/claims" element={<Claims />} />
                {/* Admin only */}
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
