'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const levelColor: Record<string,string> = { A:'#34d399', B:'#22d3ee', C:'#f87171' }

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else { setUser(data.user); loadEntries(data.user.id) }
    })
  }, [])

  const loadEntries = async (userId: string) => {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', userId)
    if (data) setEntries(data)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const getEntriesForDay = (day: number) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return entries.filter(e => e.entry_date === dateStr)
  }

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const allPre = entries.filter(e => e.session_type === 'pre')
  const allPost = entries.filter(e => e.session_type === 'post')
  const avgReadiness = allPre.length ? Math.round(allPre.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / allPre.length) : null
  const mentalCounts: Record<string,number> = { A:0, B:0, C:0 }
  allPost.forEach(e => { if (e.mental_game_level) mentalCounts[e.mental_game_level]++ })
  const topMental = Object.entries(mentalCounts).sort((a,b) => b[1]-a[1])[0]

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', fontFamily:'Georgia, serif', color:'white', padding:'24px' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <h1 style={{ color:'#22d3ee', fontSize:'28px', margin:0 }}>Your Dashboard</h1>
          <div style={{ display:'flex', gap:'12px' }}>
            <a href="/pre-trade" style={{ textDecoration:'none', fontSize:'14px', padding:'10px 20px', background:'#22d3ee', borderRadius:'8px', fontWeight:'bold', color:'#0a0f1e' }}>Pre-Trade</a>
            <a href="/post-trade" style={{ color:'#22d3ee', textDecoration:'none', fontSize:'14px', padding:'10px 20px', border:'1px solid #22d3ee', borderRadius:'8px' }}>Post-Trade</a>
            <button onClick={signOut} style={{ background:'transparent', border:'1px solid #374151', color:'#6b7280', padding:'10px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' }}>Sign Out</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginBottom:'24px' }}>
          <div style={{ background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'20px' }}>
            <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 8px' }}>TOTAL SESSIONS</p>
            <p style={{ color:'#22d3ee', fontSize:'36px', fontWeight:'bold', margin:0 }}>{entries.length}</p>
          </div>
          <div style={{ background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'20px' }}>
            <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 8px' }}>AVG READINESS</p>
            <p style={{ color:'#22d3ee', fontSize:'36px', fontWeight:'bold', margin:0 }}>{avgReadiness ? `${avgReadiness}/10` : '-'}</p>
          </div>
          <div style={{ background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'20px' }}>
            <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 8px' }}>TOP GAME</p>
            <p style={{ color: topMental && topMental[1] > 0 ? levelColor[topMental[0]] : '#22d3ee', fontSize:'36px', fontWeight:'bold', margin:0 }}>{topMental && topMental[1] > 0 ? `${topMental[0]} Game` : '-'}</p>
          </div>
        </div>

        <div style={{ background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ color:'white', fontSize:'18px', margin:0 }}>{monthNames[month]} {year}</h2>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setCurrentDate(new Date(year, month-1, 1))} style={{ background:'transparent', border:'1px solid #374151', color:'#9ca3af', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>←</button>
              <button onClick={() => setCurrentDate(new Date(year, month+1, 1))} style={{ background:'transparent', border:'1px solid #374151', color:'#9ca3af', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>→</button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', marginBottom:'8px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign:'center', color:'#6b7280', fontSize:'12px', padding:'4px' }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEntries = getEntriesForDay(day)
              const preEntry = dayEntries.find(e => e.session_type === 'pre')
              const postEntry = dayEntries.find(e => e.session_type === 'post')
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const hasEntries = dayEntries.length > 0
              return (
                <div
                  key={day}
                  onClick={() => hasEntries && (window.location.href = `/day/${dateStr}`)}
                  style={{
                    background: hasEntries ? '#1a2332' : '#0d1421',
                    border: isToday ? '1px solid #22d3ee' : '1px solid #1e3a5f',
                    borderRadius:'8px', padding:'8px', minHeight:'80px',
                    cursor: hasEntries ? 'pointer' : 'default',
                    transition:'all 0.15s'
                  }}
                >
                  <p style={{ color: isToday ? '#22d3ee' : '#6b7280', fontSize:'12px', margin:'0 0 6px' }}>{day}</p>
                  {preEntry && <div style={{ background:'#0e2a3a', borderRadius:'4px', padding:'3px 6px', marginBottom:'4px' }}><p style={{ color:'#22d3ee', fontSize:'11px', margin:0 }}>R: {preEntry.readiness_score}/10</p></div>}
                  {postEntry && postEntry.mental_game_level && <div style={{ background:'#1e3a5f', borderRadius:'4px', padding:'3px 6px', marginBottom:'2px' }}><p style={{ color:levelColor[postEntry.mental_game_level], fontSize:'11px', margin:0 }}>M: {postEntry.mental_game_level}</p></div>}
                  {postEntry && postEntry.tactical_level && <div style={{ background:'#1e3a5f', borderRadius:'4px', padding:'3px 6px' }}><p style={{ color:levelColor[postEntry.tactical_level], fontSize:'11px', margin:0 }}>T: {postEntry.tactical_level}</p></div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}