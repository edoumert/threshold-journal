'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const emotions = ['Calm','Focused','Anxious','Frustrated','Excited','Distracted','Sad','Angry','Numb','Rushed','Uncertain','Confident']

const bodyLocations = ['Chest','Jaw','Shoulders','Stomach / gut','Throat','Hands',"I don't notice it anywhere specific","I feel settled, no tension"]

const somaticPause: Record<string,string> = {
  'Chest':'Take one slow breath into your chest before you read on.',
  'Jaw':'Notice if your teeth are touching. Let them part slightly.',
  'Shoulders':'Let your shoulders drop away from your ears.',
  'Stomach / gut':'Place a hand on your belly if that feels right. Just notice.',
  'Throat':'Swallow once. Notice what\'s sitting there.',
  'Hands':'Open your hands and rest them on the desk for a moment.',
  "I don't notice it anywhere specific":"Good. Carry that settledness with you as you read on.",
  "I feel settled, no tension":"Good. Carry that settledness with you as you read on."
}

const reflectionQuestions: Record<string,string[]> = {
  Calm:["What's underneath the calm? Is it settled, or is it more like flat?","Is there anything you've been putting off noticing that might surface once the market opens?","What would you want to carry with you from this moment into the first hour of trading?"],
  Focused:["Is this focus coming from your body feeling ready, or from your mind pushing through something?","What are you most invested in being right about today?","If the setup doesn't appear, what's your plan for the energy that focus is holding?"],
  Anxious:["You already found where the anxiety lives in your body. Has it shifted at all since you noticed it?","Is this anxiety bringing information, or is it noise from something that has nothing to do with today's market?","What would need to be different in your body for you to trust yourself to trade from your plan?"],
  Frustrated:["That frustration you're holding. Did it start here, or did it walk in with you?","What story is the frustration telling you about today? Is that story true?","What would it cost you to trade from this state versus waiting until it settles?"],
  Excited:["Excitement and urgency feel almost identical in the body. Which one is actually here?","What does the excitement want you to do that your plan doesn't say to do?","What's the one rule you know you're most at risk of breaking today, and what would breaking it cost you?"],
  Distracted:["Where is your attention actually right now? Not where you want it to be, where is it?","Is sitting down to trade today a deliberate choice, or something you moved toward out of habit?","What would need to be set aside, really set aside, for you to be fully here?"],
  Sad:["Sadness lives somewhere in the body. Does it match where you pointed, or is it somewhere else too?","What is this sadness carrying? Is it from today, or something older that got triggered?","What do you actually need right now? Be honest. Is it a trade, or is it something else?"],
  Angry:["Anger has a direction. What is this anger actually pointed at?","Is there a trade you're hoping will settle something? Prove something, recover something, punish something?","What would it mean to you to walk away today and come back when this has moved through you?"],
  Numb:["Numbness is the body protecting itself. What might it be protecting you from right now?","When did you last feel fully present in your body? What was different about that day?","If you had to choose honestly, is today a trading day, or a rest day?"],
  Rushed:["The urgency you feel, where does it live? Chest, gut, somewhere else?","Is the rush coming from the market, or from something inside you that was already moving fast before you sat down?","What are you afraid will happen if you slow all the way down?"],
  Uncertain:["Is the uncertainty a felt sense in your body, or more of a thought that keeps circling?","What specifically feels uncertain? The setup, the plan, or something about yourself today?","What would it feel like to enter from a place of genuine curiosity, rather than needing to be right?"],
  Confident:["Confidence has a texture. Is this one grounded and rooted, or is it more like a charge running through you?","Is any part of you carrying doubt alongside the confidence? You don't have to dismiss it.","What do you want to remember about how this feels if the session gets difficult later?"]
}

const readinessGuide = [
  { range: [1,3], label: 'Step away today', color: '#f87171', guidance: 'Something significant is here. The most skilled move is not to trade.' },
  { range: [4,5], label: 'Proceed with real caution', color: '#fb923c', guidance: 'Trade your smallest size. No new strategies. Watch for drift.' },
  { range: [6,7], label: 'Proceed, plan only', color: '#facc15', guidance: 'High-probability setups only. No improvising.' },
  { range: [8,10], label: 'Proceed with confidence', color: '#34d399', guidance: 'Trust your preparation. Watch for overconfidence at the top end.' },
]

export default function PreTradePage() {
  const [user, setUser] = useState<any>(null)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [bodyLocation, setBodyLocation] = useState('')
  const [answers, setAnswers] = useState<Record<string,string>>({})
  const [readiness, setReadiness] = useState(5)
  const [anchor, setAnchor] = useState('')
  const [drift, setDrift] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else setUser(data.user)
    })
  }, [])

  const toggleEmotion = (e: string) => {
    setSelectedEmotions(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
    setAnswers({})
  }

  const getGuide = () => readinessGuide.find(g => readiness >= g.range[0] && readiness <= g.range[1])

  const allQuestions = selectedEmotions.flatMap(e => 
    (reflectionQuestions[e] || []).map((q, i) => ({ emotion: e, question: q, key: `${e}-${i}` }))
  )

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      session_type: 'pre',
      emotions: selectedEmotions,
      body_location: bodyLocation,
      readiness_score: readiness,
      anchor_commitment: anchor,
      anchor_drift: drift,
      reflection_answers: answers
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
    emotionBtn: (active: boolean) => ({ padding:'14px 8px', borderRadius:'10px', border: active ? '2px solid #22d3ee' : '1px solid #1e3a5f', background: active ? '#0e2a3a' : '#1a2332', color: active ? '#22d3ee' : '#9ca3af', cursor:'pointer', textAlign:'center' as const, fontSize:'14px', transition:'all 0.2s' }),
    bodyBtn: (active: boolean) => ({ padding:'10px 16px', borderRadius:'8px', border: active ? '2px solid #22d3ee' : '1px solid #1e3a5f', background: active ? '#0e2a3a' : 'transparent', color: active ? '#22d3ee' : '#9ca3af', cursor:'pointer', fontSize:'14px' }),
    textarea: { width:'100%', padding:'14px', background:'#1f2937', border:'1px solid #374151', borderRadius:'8px', color:'white', fontSize:'15px', minHeight:'90px', boxSizing:'border-box' as const, fontFamily:'Georgia, serif', resize:'vertical' as const }
  }

  return (
    <div style={st.page}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#22d3ee', fontSize:'28px', margin:0 }}>Before You Trade</h1>
            <p style={{ color:'#6b7280', margin:'4px 0 0', fontSize:'14px' }}>A moment to arrive</p>
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            <a href="/dashboard" style={{ color:'#6b7280', textDecoration:'none', fontSize:'14px', padding:'8px 16px', border:'1px solid #374151', borderRadius:'8px' }}>Dashboard</a>
            <a href="/post-trade" style={{ color:'#22d3ee', textDecoration:'none', fontSize:'14px', padding:'8px 16px', border:'1px solid #22d3ee', borderRadius:'8px' }}>Post-Trade →</a>
          </div>
        </div>

        <div style={st.card}>
          <p style={{ color:'#9ca3af', fontSize:'15px', lineHeight:'1.7', margin:'0 0 24px' }}>Before you open a position, take 60 seconds here. Not to talk yourself into or out of a trade — just to notice where you are arriving from. Honest answers only. This is for you.</p>
          
          <h2 style={st.h2}>STEP 1 — HOW ARE YOU ARRIVING TODAY?</h2>
          <p style={st.sub}>Select everything that feels true. More than one is okay.</p>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'10px', marginBottom:'24px' }}>
            {emotions.map(e => (
              <button key={e} onClick={() => toggleEmotion(e)} style={st.emotionBtn(selectedEmotions.includes(e))}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {selectedEmotions.length > 0 && (
          <div style={st.card}>
            <h2 style={st.h2}>STEP 2 — WHERE DO YOU FEEL IT?</h2>
            <p style={st.sub}>Where do you feel {selectedEmotions.join(', ')} in your body right now?</p>
            <div style={{ display:'flex', flexWrap:'wrap' as const, gap:'10px' }}>
              {bodyLocations.map(b => (
                <button key={b} onClick={() => setBodyLocation(b)} style={st.bodyBtn(bodyLocation === b)}>{b}</button>
              ))}
            </div>
          </div>
        )}

        {bodyLocation && (
          <div style={{ ...st.card, borderColor:'#22d3ee', borderWidth:'1px' }}>
            <p style={{ color:'#22d3ee', fontSize:'16px', fontStyle:'italic', margin:0 }}>
              {somaticPause[bodyLocation]}
            </p>
          </div>
        )}

        {bodyLocation && allQuestions.length > 0 && (
          <div style={st.card}>
            <h2 style={st.h2}>STEP 3 — SIT WITH THESE</h2>
            <p style={st.sub}>Take your time. There are no right answers.</p>
            {allQuestions.map(({ emotion, question, key }) => (
              <div key={key} style={{ marginBottom:'24px' }}>
                {selectedEmotions.length > 1 && <p style={{ color:'#22d3ee', fontSize:'12px', letterSpacing:'0.1em', marginBottom:'6px' }}>{emotion.toUpperCase()}</p>}
                <label style={{ color:'#e5e7eb', fontSize:'15px', display:'block', marginBottom:'8px', lineHeight:'1.6' }}>{question}</label>
                <textarea
                  style={st.textarea}
                  placeholder="Your thoughts (optional — this is for you, not for anyone else)"
                  value={answers[key] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        {bodyLocation && (
          <div style={st.card}>
            <h2 style={st.h2}>STEP 4 — READINESS CHECK</h2>
            <p style={st.sub}>On a scale of 1–10, how ready do you feel to trade from your plan right now?</p>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
              <span style={{ color:'#6b7280', fontSize:'13px' }}>1</span>
              <input type="range" min="1" max="10" value={readiness} onChange={e => setReadiness(Number(e.target.value))} style={{ flex:1 }} />
              <span style={{ color:'#6b7280', fontSize:'13px' }}>10</span>
              <span style={{ color:'#22d3ee', fontSize:'28px', fontWeight:'bold', minWidth:'32px' }}>{readiness}</span>
            </div>
            {getGuide() && (
              <div style={{ background:'#1a2332', borderLeft:`4px solid ${getGuide()!.color}`, padding:'16px', borderRadius:'0 8px 8px 0' }}>
                <p style={{ color:getGuide()!.color, fontWeight:'bold', margin:'0 0 4px', fontSize:'15px' }}>{getGuide()!.label}</p>
                <p style={{ color:'#9ca3af', margin:0, fontSize:'14px' }}>{getGuide()!.guidance}</p>
              </div>
            )}
          </div>
        )}

        {bodyLocation && (
          <div style={st.card}>
            <h2 style={st.h2}>STEP 5 — YOUR ANCHOR</h2>
            <p style={st.sub}>Before you open a chart, answer these two things.</p>
            <label style={{ color:'#e5e7eb', fontSize:'15px', display:'block', marginBottom:'8px' }}>What is one thing you are committing to protect today?</label>
            <textarea style={{ ...st.textarea, marginBottom:'20px' }} placeholder="Could be your risk limit, your plan, your emotional state..." value={anchor} onChange={e => setAnchor(e.target.value)} />
            <label style={{ color:'#e5e7eb', fontSize:'15px', display:'block', marginBottom:'8px' }}>If you notice yourself drifting from that, what will you do?</label>
            <textarea style={st.textarea} placeholder="Be specific. 'Step away' is better than 'try to do better.'" value={drift} onChange={e => setDrift(e.target.value)} />
          </div>
        )}

        {bodyLocation && (
          <div style={{ textAlign:'center' as const, marginBottom:'48px' }}>
            <button onClick={save} disabled={saving || saved} style={{ padding:'16px 48px', background:'#22d3ee', color:'#0a0f1e', border:'none', borderRadius:'10px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' }}>
              {saving ? 'Saving...' : saved ? 'Saved! Redirecting...' : 'Save Check-In & Begin Trading →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
