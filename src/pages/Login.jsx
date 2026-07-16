import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import tallyIcon from "/tally-brand-assets/brand/tally-logomark-2048.png"
import tallyWordmark from "/tally-brand-assets/wordmark/tally-wordmark-blue.svg"

export default function Login() {
  const { signIn, sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate("/")
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("Enter your email first")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await sendMagicLink(email)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMagicSent(true)
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("Enter your email first")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setForgotSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md space-y-6 rounded-3xl p-8 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center">
            <img src={tallyIcon} alt="Tally" className="h-16 w-16 rounded-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tally</h1>
            <p className="text-sm text-muted-foreground mt-1">Household + Business. Zero monthly cost.</p>
          </div>
        </div>

        {magicSent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Check your inbox</p>
              <p className="text-sm text-muted-foreground mt-1">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setMagicSent(false)} className="w-full">Back to login</Button>
          </div>
        ) : showForgot ? (
          <div className="text-center space-y-4">
            <div>
              <p className="font-medium">Reset your password</p>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
            {forgotSent ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Check <strong>{email}</strong> for reset instructions.</p>
                <Button type="button" variant="outline" onClick={() => { setShowForgot(false); setForgotSent(false); }} className="w-full">Back to login</Button>
              </div>
            ) : (
              <>
                <div className="text-left space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="button" onClick={handleForgotPassword} disabled={loading} className="w-full h-12">
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForgot(false)} className="w-full h-12">Cancel</Button>
              </>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" required />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm text-foreground cursor-pointer">Remember me</Label>
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full h-12 text-base">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[rgba(255,255,255,0.75)] px-3 py-1 text-muted-foreground dark:bg-[rgba(31,30,26,0.75)] rounded-full">or</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink}>
              <Button type="submit" disabled={loading || !email} variant="outline" className="w-full h-12">
                Send magic link
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Create one</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
