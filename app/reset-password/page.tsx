'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => setReady(true))
    } else {
      setError('Invalid or expired reset link. Please request a new one.')
    }
  }, [])

  const handleReset = async () => {
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else { setMessage('Password updated! Redirecting to login...'); setTimeout(() => router.push('/'), 2000) }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#111827', padding: '48px', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '1px solid #1e3a5f' }}>
        <h1 style={{ color: '#22d3ee', fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>The Threshold Journal</p>
        {message ? (
          <p style={{ color: '#9ca3af', textAlign: 'center' }}>{message}</p>
        ) : error && !ready ? (
          <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>
        ) : ready ? (
          <>
            <input type="password" placeholder="New password (min 6 characters)" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: 'white', fontSize: '16px', boxSizing: 'border-box' as const }} />
            {error && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
            <button onClick={handleReset} disabled={loading}
              style={{ width: '100%', padding: '14px', background: '#22d3ee', color: '#0a0f1e', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Updating...' : 'Set New Password →'}
            </button>
          </>
        ) : (
          <p style={{ color: '#9ca3af', textAlign: 'center' }}>Loading...</p>
        )}
      </div>
    </main>
  )
}