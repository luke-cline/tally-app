import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AUTH_REDIRECT = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://tally-app-iota.vercel.app/login'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always check for existing session (supabase persists it by default)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = (email, password, rememberMe = true) => {
    // Supabase handles session persistence - rememberMe controls localStorage cleanup on signout
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  
  const signOut = async () => {
    localStorage.removeItem('tally_remember_me')
    return supabase.auth.signOut()
  }
  
  const sendMagicLink = (email) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: AUTH_REDIRECT } })

  return (
    <AuthContext.Provider value={{ session, user: session?.user, loading, signIn, signUp, signOut, sendMagicLink }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
