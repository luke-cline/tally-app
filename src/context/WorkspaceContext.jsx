import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './AuthContext'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceType, setWorkspaceType] = useState('household')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    supabase
      .from('workspace_members')
      .select('workspace_id, workspaces(id, name, type)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Workspace fetch error:', error)
          if (error.message && error.message.includes('infinite recursion')) {
            setError('Workspace access error. Please contact support or try again later.')
          } else {
            setError(error.message)
          }
        } else if (data) {
          setWorkspaces(data.map(d => d.workspaces).filter(Boolean))
        }
        setLoading(false)
      })
  }, [user])

  const currentWorkspace = workspaces.find(w => w.type === workspaceType)

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6 text-center">
        <div>
          <p className="font-semibold text-destructive mb-2">Could not load workspaces</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!loading && (!workspaces || workspaces.length === 0)) {
    return <Onboarding user={user} />
  }

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      workspaceType,
      setWorkspaceType,
      workspaceId: currentWorkspace?.id,
      loading
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

function Onboarding({ user }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const createHousehold = async () => {
    setCreating(true)
    setError("")
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: "Household", type: "household", created_by: user.id, updated_by: user.id })
      .select("id")
      .single()

    if (error) {
      setError("Could not create workspace")
      setCreating(false)
      return
    }

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: data.id, user_id: user.id, role: "admin" })

    if (memberError) {
      setError("Could not join workspace")
      setCreating(false)
      return
    }

    window.location.href = "/"
  }

  const createBusiness = async () => {
    setCreating(true)
    setError("")
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: "Business", type: "business", created_by: user.id, updated_by: user.id })
      .select("id")
      .single()

    if (error) {
      setError("Could not create workspace")
      setCreating(false)
      return
    }

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: data.id, user_id: user.id, role: "admin" })

    if (memberError) {
      setError("Could not join workspace")
      setCreating(false)
      return
    }

    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-panel w-full max-w-md space-y-6 rounded-2xl p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Welcome to Tally</h1>
          <p className="text-sm text-muted-foreground">Create your first workspace to get started.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={createHousehold}
            disabled={creating}
            className="glass-panel rounded-2xl p-5 text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <p className="font-semibold">Household</p>
            <p className="text-xs text-muted-foreground mt-1">Groceries, kids, bills</p>
          </button>

          <button
            onClick={createBusiness}
            disabled={creating}
            className="glass-panel rounded-2xl p-5 text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <p className="font-semibold">Business</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue, tools, contractors</p>
          </button>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <p className="text-xs text-center text-muted-foreground">
          You can add more workspaces later in Settings.
        </p>
      </div>
    </div>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}