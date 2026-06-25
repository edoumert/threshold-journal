'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const mentalBehaviors = [
  { label:'Distracted', level:'C' },
  { label:'Risk averse (hesitating)', level:'C' },
  { label:'Forcing trades to overcome hesitance', level:'C' },
  { label:'No patience', level:'C' },
  { label:'Negative self talk', level:'C' },
  { label:'Self-doubt', level:'C' },
  { label:'Trading P&L', level:'C' },
  { label:'Overthinking', level:'B' },
  { label:'Attention on wrong market', level:'B' },
  { label:'Losing focus', level:'B' },
  { label:'Missing obvious trades', level:'B' },
  { label:'Looking at P&L', level:'B' },
  { label:'Reacting slower', level:'B' },
  { label:'Going against gut', level:'B' },
  { label:'Very relaxed', level:'A' },
  { label:'Decisive', level:'A' },
  { label:'Patient', level:'A' },
  { label:'Confident', level:'A' },
  { label:'Trusting gut', level:'A' },
]

const tacticalBehaviors = [
  { label:'Chasing price', level:'C' },
  { label:'Fading directional moves', level:'C' },
  { label:'Cutting trades too soon because I want to get paid', level:'C' },
  { label:"Didn't follow loss limit rules", level:'C' },
  { label:'Making impulsive trades because I\'m overreacting to one element', level:'C' },
  { label:'Scaling without planning for price going against me', level:'C' },
  { label:'Worse understanding of context, correlation, or location', level:'B' },
  { label:'Scalping for a few ticks, but no big trades', level:'B' },
  { label:'Not aware enough to sit out or pick my spots', level:'B' },
  { label:'Cutting trades too soon and not giving it enough room', level:'B' },
  { label:'Too much attention to depth', level:'B' },
  { label:'No good read on volatility', level:'B' },
  { label:'Clear understanding of context of the market as a whole', level:'A' },
  { label:'Clear understanding of correlation with NA, ES and DOW', level:'A' },
  { label:'Clear understanding of location, price levels, and where we are on the chart', level:'A' },
  { label:'Letting price come to me', level:'A' },
  { label:'Seeing trapped traders', level:'A' },
]

const levelColor: Record<string,string> = { A:'#34d399', B:'#22d3ee', C:'#f87171' }

function calcLevel(checked: string[], behaviors: typeof mentalBehaviors) {
  const counts: Record<string,number> = { A:0, B:0, C:0 }
  checked.forEach(label => {
    const b = behaviors.find(x => x.label === label)
    if (b) counts[b.level]++
  })
  if (counts.C > 0) return 'C'
  if (counts.B > 0) return 'B'
  if (counts.A > 0) return 'A'
  return null
}

function BehaviorGrid({ behaviors, checked, onToggle }: { behaviors: typeof mentalBehaviors, checked: string[], onToggle: (l:string)=>void }) {
  return (
    <div>
      {behaviors.map(({ label, level }) => {
        const isChecked = checked.includes(label)
        return (
          <div
            key={label}
            onClick={() => onToggle(label)}
            style={{
              display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px',
              borderRadius:'8px', cursor:'pointer', marginBottom:'8px',
              background: isChecked ? `${levelColor[level]}18` : '#1a2332',
              border: isChecked ? `1px solid ${levelColor[level]}` : '1px solid #1e3a5f',
              transition:'all 0.15s'
            }}
          >
            <div style={{
              width:'20px', height:'20px', borderRadius:'4px', flexShrink:0,
              border: `2px solid ${isChecked ? levelColor[level] : '#374151'}`,
              background: isChecked ? levelColor[level] : 'transparent'
            }}/>
            <span style={{ color: isChecked ? 'white' : '#9ca3af', fontSize:'15px' }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function GameResult({ level }: { level: string | null }) {
  if (!level) return null
  const messages: Record<string,string> = {
    A: 'You were in your A Game today. This is what peak performance feels like — remember it.',
    B: 'You were in your B Game today. Good awareness. Identify what pulled you off your best.',
    C: 'You were in your C Game today. This is valuable data. What was the root cause?'
  }
  return (
    <div style={{
      marginTop:'20px', padding:'16px 20px', borderRadius:'10px',
      border: `2px solid ${levelColor[level]}`,
      background: `${levelColor[level]}15`
    }}>
      <p style={{ color: levelColor[level], fontWeight:'bold', fontSize:'18px', margin:'0 0 4px' }}>
        {level} Game
      </p>
      <p style={{ color:'#9ca3af', margin:0, fontSize:'14px' }}>{messages[level]}</p>
    </div>
  )
}

export default function PostTradePage() {
  const [user, setUser] = useState<any>(null)
  const [mentalChecked, setMentalChecked] = useState<string[]>([])
  const [tacticalChecked, setTacticalChecked] = useState<string[]>([])
  const [steps, setSteps] = useState(['','','','',''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else setUser(data.user)
    })
  }, [])

  const mentalLevel = calcLevel(mentalChecked, mentalBehaviors)
  const tacticalLevel = calcLevel(tacticalChecked, tacticalBehaviors)

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      session_type: 'post',
      mental_game_level: mentalLevel,
      tactical_level: tacticalLevel,
      mental_checkboxes: mentalChecked,
      tactical_checkboxes: tacticalChecked,
      mhh_step1: steps[0], mhh_step2: steps[1], mhh_step3: steps[2],
      mhh_step4: steps[3], mhh_step5: steps[4]
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => window.location.href = '/dashboard', 2000)
  }

  const st = {
    page: { minHeight:'100vh', background:'#0a0f1e', fontFamily:'Georgia, serif', color:'white', padding:'24px' },
    card: { background:'#111827', border:'1px solid #1e3a5f', borderRadius:'12px', padding:'32px', marginBottom:'24px' },
    h2: { color:'#22d3ee', fontSize:'20px', marginBottom:'8px', letterSpacing:'0.05em' },
    sub: { color:'#6b7280', fontSize:'14px', marginBottom:'24px' },
    textarea: { width:'100%', padding:'14px', background:'#1f2937', border:'1px solid #374151', borderRadius:'8px', color:'white', fontSize:'15px', minHeight:'100px', boxSizing:'border-box' as const, fontFamily:'Georgia, serif', resize:'vertical' as const }
  }

  return (
    <div style={st.page}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#22d3ee', fontSize:'28px', margin:0 }}>After The Trade</h1>
            <p style={{ color:'#6b7280', margin:'4px 0 0', fontSize:'14px' }}>Your post-session analysis</p>
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            <a href="/pre-trade" style={{ color:'#6b7280', textDecoration:'none', fontSize:'14px', padding:'8px 16px', border:'1px solid #374151', borderRadius:'8px' }}>← Pre-Trade</a>
            <a href="/dashboard" style={{ color:'#22d3ee', textDecoration:'none', fontSize:'14px', padding:'8px 16px', border:'1px solid #22d3ee', borderRadius:'8px' }}>Dashboard</a>
          </div>
        </div>

        <div style={st.card}>
          <h2 style={st.h2}>MENTAL GAME</h2>
          <p style={{ color:'#9ca3af', fontSize:'15px', lineHeight:'1.7', margin:'0 0 20px' }}>Check everything that showed up for you today. Be honest — this is your data.</p>
          <BehaviorGrid behaviors={mentalBehaviors} checked={mentalChecked} onToggle={label => setMentalChecked(prev => prev.includes(label) ? prev.filter(x=>x!==label) : [...prev, label])} />
          <GameResult level={mentalLevel} />
        </div>

        <div style={st.card}>
          <h2 style={st.h2}>TACTICAL SKILLS</h2>
          <p style={{ color:'#9ca3af', fontSize:'15px', lineHeight:'1.7', margin:'0 0 20px' }}>Check everything that showed up in your execution today.</p>
          <BehaviorGrid behaviors={tacticalBehaviors} checked={tacticalChecked} onToggle={label => setTacticalChecked(prev => prev.includes(label) ? prev.filter(x=>x!==label) : [...prev, label])} />
          <GameResult level={tacticalLevel} />
        </div>

        <div style={st.card}>
          <h2 style={st.h2}>MENTAL HAND HISTORY</h2>
          <p style={st.sub}>Walk through the mental pattern that showed up today.</p>
          {[
            'Step 1: Describe the problem in detail',
            'Step 2: Explain why it makes sense that you have this problem, or why you think, feel, or react that way',
            'Step 3: Explain why the logic in step 2 is flawed',
            'Step 4: Come up with a correction to that flawed logic',
            'Step 5: Explain why that correction is correct'
          ].map((label, i) => (
            <div key={i} style={{ marginBottom:'24px' }}>
              <label style={{ color:'#22d3ee', fontSize:'13px', letterSpacing:'0.05em', display:'block', marginBottom:'8px' }}>{label.toUpperCase()}</label>
              <textarea style={st.textarea} placeholder="Your thoughts..." value={steps[i]} onChange={e => { const n=[...steps]; n[i]=e.target.value; setSteps(n) }} />
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center' as const, marginBottom:'48px' }}>
          <button onClick={save} disabled={saving||saved} style={{ padding:'16px 48px', background:'#22d3ee', color:'#0a0f1e', border:'none', borderRadius:'10px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' }}>
            {saving ? 'Saving...' : saved ? 'Saved! Redirecting...' : 'Save Post-Trade Analysis →'}
          </button>
        </div>
      </div>
    </div>
  )
}
