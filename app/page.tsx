'use client'
import { useState } from 'react'
import { supabase } from './supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/pre-trade'
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Georgia, serif'}}>
      <div style={{background:'#111827',padding:'48px',borderRadius:'12px',width:'100%',maxWidth:'420px',border:'1px solid #1e3a5f'}}>
        <h1 style={{color:'#22d3ee',fontSize:'28px',marginBottom:'8px',textAlign:'center'}}>The Threshold Journal</h1>
        <p style={{color:'#6b7280',textAlign:'center',marginBottom:'32px',fontSize:'14px'}}>Trade with clarity, regulation & control</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{width:'100%',padding:'12px',marginBottom:'12px',background:'#1f2937',border:'1px solid #374151',borderRadius:'8px',color:'white',fontSize:'16px',boxSizing:'border-box'}}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width:'100%',padding:'12px',marginBottom:'20px',background:'#1f2937',border:'1px solid #374151',borderRadius:'8px',color:'white',fontSize:'16px',boxSizing:'border-box'}}
        />
        {error && <p style={{color:'#f87171',marginBottom:'12px',fontSize:'14px'}}>{error}</p>}
        {message && <p style={{color:'#34d399',marginBottom:'12px',fontSize:'14px'}}>{message}</p>}
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{width:'100%',padding:'14px',background:'#22d3ee',color:'#0a0f1e',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
        <p style={{color:'#6b7280',textAlign:'center',marginTop:'20px',fontSize:'14px'}}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{color:'#22d3ee',cursor:'pointer',marginLeft:'8px'}}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </main>
  )
}
