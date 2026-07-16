import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import tallyIcon from "/tally-brand-assets/brand/tally-logomark-2048.png"
import tallyWordmark from "/tally-brand-assets/wordmark/tally-wordmark-blue.svg"

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel w-full max-w-md space-y-6 rounded-3xl p-8 shadow-2xl text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src={tallyIcon} alt="Tally" className="h-16 w-16 rounded-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tally</h1>
            <p className="text-sm text-muted-foreground mt-1">Household + Business. Zero monthly cost.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ArrowRight size={28} />
            </div>
            <div>
              <p className="font-medium">Welcome to Tally</p>
              <p className="text-sm text-muted-foreground mt-1">We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => navigate("/login")} className="w-full h-12">Back to login</Button>
          </div>
        </div>
      </div>
    )
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
            <p className="text-sm text-muted-foreground mt-1">One account. Household + Business.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12" required />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full h-12 text-base">
            {loading ? "Creating account..." : "Get Started"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}