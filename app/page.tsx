'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Handle tokens in URL (magic links, password reset)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data }) => {
          if (data.session) {
            if (type === 'recovery') {
              router.push('/reset-password')
            } else {
              router.push('/pre-trade')
            }
          }
        })
    }

    // Check if already logged in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/pre-trade')
    })
  }, [])

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setMessage('Account created! You can now log in.')
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://journal.erindoumert.com/'
    })
    if (error) setError(error.message)
    else setMessage('Password reset email sent! Check your inbox.')
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    background: '#1f2937', border: '1px solid #374151',
    borderRadius: '8px', color: 'white', fontSize: '16px',
    boxSizing: 'border-box' as const
  }

  const btnStyle = {
    width: '100%', padding: '14px', background: '#22d3ee',
    color: '#0a0f1e', border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: 'bold' as const, cursor: 'pointer'
  }

  const linkStyle = {
    background: 'none', border: 'none', color: '#22d3ee',
    cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#111827', padding: '48px', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '1px solid #1e3a5f' }}>
        <h1 style={{ color: '#22d3ee', fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>The Threshold Journal</h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>Trade with clarity, regulation & control</p>

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>{message}</p>
            <button style={linkStyle} onClick={() => { setMessage(''); setMode('login') }}>Back to login</button>
          </div>
        ) : (
          <>
            {mode === 'forgot' ? (
              <>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <input type="email" placeholder="Your email address" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgot()}
                  style={inputStyle} />
                {error && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button onClick={handleForgot} disabled={loading} style={btnStyle}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button style={linkStyle} onClick={() => { setMode('login'); setError('') }}>Back to login</button>
                </p>
              </>
            ) : (
              <>
                <input type="email" placeholder="Your email address" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle} />
                <input type="password" placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                  style={inputStyle} />
                {error && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
                <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} style={btnStyle}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                </button>

                {mode === 'login' && (
                  <p style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button style={linkStyle} onClick={() => { setMode('forgot'); setError('') }}>Forgot password?</button>
                  </p>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button style={linkStyle} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}