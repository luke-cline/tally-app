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
          setError(error.message)
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

export function useWorkspace() {
  return useContext(WorkspaceContext)
}