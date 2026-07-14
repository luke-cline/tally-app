import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { WorkspaceProvider } from "@/context/WorkspaceContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import AddTransaction from "@/pages/AddTransaction"
import Categories from "@/pages/Categories"
import Recurring from "@/pages/Recurring"
import History from "@/pages/History"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <WorkspaceProvider>
                <Layout><Dashboard /></Layout>
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