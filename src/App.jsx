import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { WorkspaceProvider } from "@/context/WorkspaceContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Dashboard from "@/pages/Dashboard"
import AddTransaction from "@/pages/AddTransaction"
import Categories from "@/pages/Categories"
import EditTransaction from "@/pages/EditTransaction"
import Recurring from "@/pages/Recurring"
import History from "@/pages/History"

function SplashScreen() {
  const { loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSplash(false), 1800)
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (!showSplash) return null

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/tally-brand-assets/brand/tally-logomark-2048.png" alt="Tally" className="splash-icon" />
        <h1 className="splash-title">Tally</h1>
        <p className="splash-subtitle">Household + Business</p>
      </div>
      <style>{splashStyles}</style>
    </div>
  )
}

const splashStyles = `
  .splash-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #E7E4D9;
    transition: opacity 0.4s ease-out;
  }
  :root[class~="dark"] .splash-screen { background: #1A1512; }
  
  .splash-content { text-align: center; }
  .splash-icon { width: 80px; height: 80px; border-radius: 20px; margin-bottom: 24px; }
  .splash-title { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 700; color: #221C18; margin: 0 0 8px; }
  :root[class~="dark"] .splash-title { color: #F5FEFB; }
  .splash-subtitle { font-family: 'Inter', sans-serif; font-size: 16px; color: #6B645D; margin: 0; }
  :root[class~="dark"] .splash-subtitle { color: #B8B2A8; }
`

export default function App() {
  return (
    <AuthProvider>
      <SplashScreen />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><Dashboard /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
          <Route path="/edit/:id" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><EditTransaction /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><AddTransaction /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><Categories /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
          <Route path="/recurring" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><Recurring /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><History /></Layout>
              </WorkspaceProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}