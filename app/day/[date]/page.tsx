'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

const levelColor: Record<string,string> = { A:'#34d399', B:'#22d3ee', C:'#f87171' }

export default function DayPage({ params }: { params: { date: string } }) {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else loadEntries(data.user.id)
    })
  }, [])

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
    if (data) {
      const filtered = data.filter(e => {
        const entryDate = e.entry_date || e.created_at?.substring(0, 10)
        return entryDate === params.date
      })
      setEntries(filtered)
    }
    setLoading(false)
  }

  const preEntry = entries.find(e => e.session_type === 'pre')
  const postEntry = entries.find(e => e.session_type === 'post')

  const st = {
    page: { minHeight:'100vh', background:'#0a0f1e', fontFamily:'Georgia, serif', color:'white', padding:'24px' },
    card: { background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'32px', marginBottom:'24px' },
    h2: { color:'#22d3ee', fontSize:'20px', marginBottom:'16px', letterSpacing:'0.05em' },
    label: { color:'#22d3ee', fontSize:'13px', letterSpacing:'0.05em', display:'block' as const, marginBottom:'6px' },
    answer: { color:'#e5e7eb', fontSize:'15px', lineHeight:'1.7', background:'#1f2937', padding:'14px', borderRadius:'8px', marginBottom:'16px' }
  }

  return (
    <div style={st.page}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#22d3ee', fontSize:'28px', margin:0 }}>{params.date}</h1>
            <p style={{ color:'#6b7280', margin:'4px 0 0', fontSize:'14px' }}>Journal Entry</p>
          </div>
          <a href="/dashboard" style={{ color:'#22d3ee', textDecoration:'none', fontSize:'14px', padding:'8px 16px', border:'1px solid #22d3ee', borderRadius:'8px' }}>← Dashboard</a>
        </div>

        {loading && <p style={{ color:'#6b7280' }}>Loading...</p>}

        {!loading && entries.length === 0 && (
          <div style={st.card}>
            <p style={{ color:'#6b7280' }}>No entries for this day.</p>
            <a href="/pre-trade" style={{ color:'#22d3ee', fontSize:'14px' }}>+ Add Pre-Trade entry</a>
          </div>
        )}

        {preEntry && (
          <div style={st.card}>
            <h2 style={st.h2}>PRE-TRADE CHECK-IN</h2>
            {preEntry.emotions && preEntry.emotions.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <span style={st.label}>ARRIVED AS</span>
                <div style={{ display:'flex', flexWrap:'wrap' as const, gap:'8px' }}>
                  {preEntry.emotions.map((e: string) => (
                    <span key={e} style={{ background:'#0e2a3a', color:'#22d3ee', padding:'4px 12px', borderRadius:'20px', fontSize:'14px' }}>{e}</span>
                  ))}
                </div>
              </div>
            )}
            {preEntry.body_location && (
              <div style={{ marginBottom:'16px' }}>
                <span style={st.label}>BODY LOCATION</span>
                <p style={{ color:'#e5e7eb', margin:0 }}>{preEntry.body_location}</p>
              </div>
            )}
            {preEntry.readiness_score && (
              <div style={{ marginBottom:'16px' }}>
                <span style={st.label}>READINESS</span>
                <p style={{ color:'#22d3ee', fontSize:'24px', fontWeight:'bold', margin:0 }}>{preEntry.readiness_score}/10</p>
              </div>
            )}
            {preEntry.anchor_commitment && (
              <div style={{ marginBottom:'16px' }}>
                <span style={st.label}>COMMITMENT</span>
                <div style={st.answer}>{preEntry.anchor_commitment}</div>
              </div>
            )}
            {preEntry.anchor_drift && (
              <div>
                <span style={st.label}>IF I DRIFT</span>
                <div style={st.answer}>{preEntry.anchor_drift}</div>
              </div>
            )}
          </div>
        )}

        {postEntry && (
          <div style={st.card}>
            <h2 style={st.h2}>POST-TRADE ANALYSIS</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
              {postEntry.mental_game_level && (
                <div style={{ background:'#1a2332', padding:'16px', borderRadius:'8px', border:`1px solid ${levelColor[postEntry.mental_game_level]}` }}>
                  <p style={{ color:'#6b7280', fontSize:'12px', margin:'0 0 4px' }}>MENTAL GAME</p>
                  <p style={{ color:levelColor[postEntry.mental_game_level], fontSize:'24px', fontWeight:'bold', margin:0 }}>{postEntry.mental_game_level} Game</p>
                </div>
              )}
              {postEntry.tactical_level && (
                <div style={{ background:'#1a2332', padding:'16px', borderRadius:'8px', border:`1px solid ${levelColor[postEntry.tactical_level]}` }}>
                  <p style={{ color:'#6b7280', fontSize:'12px', margin:'0 0 4px' }}>TACTICAL SKILLS</p>
                  <p style={{ color:levelColor[postEntry.tactical_level], fontSize:'24px', fontWeight:'bold', margin:0 }}>{postEntry.tactical_level} Game</p>
                </div>
              )}
            </div>
            {postEntry.mental_checkboxes && postEntry.mental_checkboxes.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <span style={st.label}>MENTAL PATTERNS</span>
                {postEntry.mental_checkboxes.map((item: string) => (
                  <p key={item} style={{ color:'#e5e7eb', margin:'4px 0', fontSize:'14px' }}>• {item}</p>
                ))}
              </div>
            )}
            {postEntry.tactical_checkboxes && postEntry.tactical_checkboxes.length > 0 && (
              <div style={{ marginBottom:'20px' }}>
                <span style={st.label}>TACTICAL PATTERNS</span>
                {postEntry.tactical_checkboxes.map((item: string) => (
                  <p key={item} style={{ color:'#e5e7eb', margin:'4px 0', fontSize:'14px' }}>• {item}</p>
                ))}
              </div>
            )}
            {postEntry.mhh_step1 && (
              <div>
                <span style={st.label}>MENTAL HAND HISTORY</span>
                {[postEntry.mhh_step1, postEntry.mhh_step2, postEntry.mhh_step3, postEntry.mhh_step4, postEntry.mhh_step5].map((step, i) => step ? (
                  <div key={i} style={{ marginBottom:'12px' }}>
                    <p style={{ color:'#22d3ee', fontSize:'12px', margin:'0 0 4px' }}>STEP {i+1}</p>
                    <div style={st.answer}>{step}</div>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}