'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data }) => {
          if (data.session) router.push('/pre-trade')
        })
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/pre-trade')
    })
  }, [])

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://journal.erindoumert.com/' }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#111827', padding: '48px', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '1px solid #1e3a5f' }}>
        <h1 style={{ color: '#22d3ee', fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>The Threshold Journal</h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>Trade with clarity, regulation & control</p>

        {!sent ? (
          <>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', textAlign: 'center', lineHeight: '1.6' }}>
              Enter your email and we'll send you a magic link to sign in instantly — no password needed.
            </p>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: 'white', fontSize: '16px', boxSizing: 'border-box' as const }}
            />
            {error && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
            <button
              onClick={handleMagicLink}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: '#22d3ee', color: '#0a0f1e', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send Magic Link →'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' as const }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</p>
            <h2 style={{ color: '#22d3ee', fontSize: '22px', marginBottom: '12px' }}>Check your email!</h2>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.7' }}>
              We sent a magic link to <strong style={{ color: 'white' }}>{email}</strong>. Click the link to sign in instantly.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              style={{ marginTop: '24px', background: 'transparent', border: '1px solid #374151', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </main>
  )
}