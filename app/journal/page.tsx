'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const mentalGame = {
  C: ['Distracted','Risk averse (hesitating)','Forcing trades to overcome hesitance','No patience','Negative self talk','Self-doubt','Trading P&L'],
  B: ['Overthinking','Attention on wrong market','Losing focus','Missing obvious trades','Looking at P&L','Reacting slower','Going against gut'],
  A: ['Very relaxed','Decisive','Patient','Confident','Trusting gut']
}

const tacticalGame = {
  C: ['Chasing price','Fading directional moves','Cutting trades too soon to get paid','Didn\'t follow loss limit rules','Making impulsive trades','Scaling without planning'],
  B: ['Worse understanding of context/correlation/location','Scalping for ticks but no big trades','Not aware enough to sit out','Cutting trades too soon','Too much attention to depth','No good read on volatility'],
  A: ['Clear understanding of market context','Clear understanding of correlation with NA, ES and DOW','Clear understanding of location and price levels','Letting price come to me','Seeing trapped traders']
}

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [mentalLevel, setMentalLevel] = useState('')
  const [tacticalLevel, setTacticalLevel] = useState('')
  const [mentalChecked, setMentalChecked] = useState<string[]>([])
  const [tacticalChecked, setTacticalChecked] = useState<string[]>([])
  const [steps, setSteps] = useState(['','','','',''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else { setUser(data.user); loadEntries(data.user.id) }
    })
  }, [])

  const loadEntries = async (userId: string) => {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) {
      setEntries(data)
      calcStats(data)
    }
  }

  const calcStats = (data: any[]) => {
    if (!data.length) return
    const mentalCount = { A: 0, B: 0, C: 0 }
    const tacticalCount = { A: 0, B: 0, C: 0 }
    data.forEach(e => {
      if (e.mental_game_level) mentalCount[e.mental_game_level as 'A'|'B'|'C']++
      if (e.tactical_level) tacticalCount[e.tactical_level as 'A'|'B'|'C']++
    })
    setStats({ mentalCount, tacticalCount, total: data.length })
  }

  const toggleCheck = (item: string, type: 'mental'|'tactical') => {
    if (type === 'mental') {
      setMentalChecked(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
    } else {
      setTacticalChecked(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
    }
  }

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      mental_game_level: mentalLevel,
      tactical_level: tacticalLevel,
      mental_checkboxes: mentalChecked,
      tactical_checkboxes: tacticalChecked,
      mhh_step1: steps[0], mhh_step2: steps[1], mhh_step3: steps[2], mhh_step4: steps[3], mhh_step5: steps[4]
    })
    setSaving(false)
    setSaved(true)
    setMentalLevel(''); setTacticalLevel(''); setMentalChecked([]); setTacticalChecked([]); setSteps(['','','','',''])
    loadEntries(user.id)
    setTimeout(() => setSaved(false), 3000)
  }

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const s = { page: {minHeight:'100vh',background:'#0a0f1e',fontFamily:'Georgia, serif',color:'white',padding:'24px'}, card: {background:'#111827',border:'1px solid #1e3a5f',borderRadius:'12px',padding:'32px',marginBottom:'24px'}, h2: {color:'#22d3ee',fontSize:'22px',marginBottom:'20px'}, levelBtn: (active: boolean) => ({padding:'10px 28px',borderRadius:'8px',border:'2px solid #22d3ee',background:active?'#22d3ee':'transparent',color:active?'#0a0f1e':'#22d3ee',cursor:'pointer',fontWeight:'bold',marginRight:'12px',fontSize:'16px'}), checkbox: {display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'8px',cursor:'pointer',marginBottom:'8px'}, textarea: {width:'100%',padding:'14px',background:'#1f2937',border:'1px solid #374151',borderRadius:'8px',color:'white',fontSize:'15px',minHeight:'100px',boxSizing:'border-box' as const,fontFamily:'Georgia, serif'} }

  return (
    <div style={s.page}>
      <div style={{maxWidth:'800px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
          <h1 style={{color:'#22d3ee',fontSize:'32px'}}>The Threshold Journal</h1>
          <button onClick={signOut} style={{background:'transparent',border:'1px solid #374151',color:'#6b7280',padding:'8px 16px',borderRadius:'8px',cursor:'pointer'}}>Sign Out</button>
        </div>

        {stats && (
          <div style={s.card}>
            <h2 style={s.h2}>Your Performance Tally</h2>
            <p style={{color:'#9ca3af',marginBottom:'16px'}}>Based on {stats.total} entries</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
              <div>
                <h3 style={{color:'white',marginBottom:'12px'}}>Mental Game</h3>
                {['A','B','C'].map(l => (
                  <div key={l} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                    <span style={{color:'#22d3ee',width:'20px',fontWeight:'bold'}}>{l}</span>
                    <div style={{flex:1,background:'#1f2937',borderRadius:'4px',height:'20px'}}>
                      <div style={{width:`${stats.total ? (stats.mentalCount[l]/stats.total*100) : 0}%`,background:l==='A'?'#34d399':l==='B'?'#22d3ee':'#f87171',height:'100%',borderRadius:'4px',transition:'width 0.5s'}}/>
                    </div>
                    <span style={{color:'#9ca3af',width:'30px'}}>{stats.mentalCount[l]}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{color:'white',marginBottom:'12px'}}>Tactical Skills</h3>
                {['A','B','C'].map(l => (
                  <div key={l} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                    <span style={{color:'#22d3ee',width:'20px',fontWeight:'bold'}}>{l}</span>
                    <div style={{flex:1,background:'#1f2937',borderRadius:'4px',height:'20px'}}>
                      <div style={{width:`${stats.total ? (stats.tacticalCount[l]/stats.total*100) : 0}%`,background:l==='A'?'#34d399':l==='B'?'#22d3ee':'#f87171',height:'100%',borderRadius:'4px',transition:'width 0.5s'}}/>
                    </div>
                    <span style={{color:'#9ca3af',width:'30px'}}>{stats.tacticalCount[l]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={s.card}>
          <h2 style={s.h2}>New Entry — A to C Game Analysis</h2>
          
          <h3 style={{color:'white',marginBottom:'12px'}}>Mental Game</h3>
          <div style={{marginBottom:'20px'}}>
            {(['A','B','C'] as const).map(l => <button key={l} onClick={() => { setMentalLevel(l); setMentalChecked([]) }} style={s.levelBtn(mentalLevel===l)}>{l} Game</button>)}
          </div>
          {mentalLevel && mentalGame[mentalLevel as 'A'|'B'|'C'].map(item => (
            <div key={item} onClick={() => toggleCheck(item,'mental')} style={{...s.checkbox, background: mentalChecked.includes(item)?'#1e3a5f':'transparent'}}>
              <div style={{width:'20px',height:'20px',border:'2px solid #22d3ee',borderRadius:'4px',background:mentalChecked.includes(item)?'#22d3ee':'transparent',flexShrink:0}}/>
              <span style={{color:'#e5e7eb'}}>{item}</span>
            </div>
          ))}

          <h3 style={{color:'white',margin:'24px 0 12px'}}>Tactical Skills</h3>
          <div style={{marginBottom:'20px'}}>
            {(['A','B','C'] as const).map(l => <button key={l} onClick={() => { setTacticalLevel(l); setTacticalChecked([]) }} style={s.levelBtn(tacticalLevel===l)}>{l} Game</button>)}
          </div>
          {tacticalLevel && tacticalGame[tacticalLevel as 'A'|'B'|'C'].map(item => (
            <div key={item} onClick={() => toggleCheck(item,'tactical')} style={{...s.checkbox, background: tacticalChecked.includes(item)?'#1e3a5f':'transparent'}}>
              <div style={{width:'20px',height:'20px',border:'2px solid #22d3ee',borderRadius:'4px',background:tacticalChecked.includes(item)?'#22d3ee':'transparent',flexShrink:0}}/>
              <span style={{color:'#e5e7eb'}}>{item}</span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.h2}>Mental Hand History</h2>
          {[
            'Step 1: Describe the problem in detail',
            'Step 2: Explain why it makes sense that you have this problem',
            'Step 3: Explain why the logic in step 2 is flawed',
            'Step 4: Come up with a correction to that flawed logic',
            'Step 5: Explain why that correction is correct'
          ].map((label, i) => (
            <div key={i} style={{marginBottom:'24px'}}>
              <label style={{color:'#22d3ee',fontSize:'14px',letterSpacing:'0.05em',display:'block',marginBottom:'8px'}}>{label}</label>
              <textarea
                style={s.textarea}
                placeholder="Your thoughts..."
                value={steps[i]}
                onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n) }}
              />
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{padding:'14px 40px',background:'#22d3ee',color:'#0a0f1e',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
          {saved && <span style={{color:'#34d399',marginLeft:'16px'}}>Entry saved! ✓</span>}
        </div>

        {entries.length > 0 && (
          <div style={s.card}>
            <h2 style={s.h2}>Past Entries</h2>
            {entries.map(entry => (
              <div key={entry.id} style={{borderBottom:'1px solid #1e3a5f',paddingBottom:'16px',marginBottom:'16px'}}>
                <div style={{display:'flex',gap:'16px',marginBottom:'8px'}}>
                  <span style={{color:'#9ca3af',fontSize:'14px'}}>{new Date(entry.created_at).toLocaleDateString()}</span>
                  {entry.mental_game_level && <span style={{color:'#22d3ee',fontSize:'14px'}}>Mental: {entry.mental_game_level} Game</span>}
                  {entry.tactical_level && <span style={{color:'#22d3ee',fontSize:'14px'}}>Tactical: {entry.tactical_level} Game</span>}
                </div>
                {entry.mhh_step1 && <p style={{color:'#9ca3af',fontSize:'14px'}}>{entry.mhh_step1.substring(0,100)}...</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
