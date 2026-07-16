import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user chose "Remember me" — if not, clear persisted session on cold start
    const persist = localStorage.getItem('tally_remember_me')
    if (persist !== 'true') {
      // Don't restore from localStorage; only check for in-memory session
      // This effectively logs out users who close the browser
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email, password, rememberMe = true) => {
    // Store the user's preference
    localStorage.setItem('tally_remember_me', rememberMe ? 'true' : 'false')
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  
  const signOut = async () => {
    localStorage.removeItem('tally_remember_me')
    return supabase.auth.signOut()
  }
  
  const sendMagicLink = (email) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })

  return (
    <AuthContext.Provider value={{ session, user: session?.user, loading, signIn, signUp, signOut, sendMagicLink }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
