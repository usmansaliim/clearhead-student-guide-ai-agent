import { useState, useEffect, useRef } from "react"

const SESSION_ID = (() => {
  const stored = localStorage.getItem("clearhead_session")
  if (stored) return stored
  const id = Math.random().toString(36).substring(2, 9)
  localStorage.setItem("clearhead_session", id)
  return id
})()

const API = "http://localhost:5000"

const CHALLENGES = [
  { id: "academics", label: "📚 Academics", sub: "GPA, exams, assignments" },
  { id: "career", label: "💼 Career", sub: "Internships, portfolio, jobs" },
  { id: "stress", label: "😮‍💨 Stress", sub: "Burnout, anxiety, motivation" },
  { id: "finances", label: "💸 Finances", sub: "Budgeting, expenses" },
  { id: "direction", label: "🧭 Direction", sub: "Lost, no plan, unclear goals" },
  { id: "social", label: "👥 Social", sub: "Friends, family, relationships" },
]

const UNIVERSITIES = ["NUST", "LUMS", "FAST", "COMSATS", "UET", "IBA", "NED", "GIKI", "Other"]
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"]

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ── Onboarding ──────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ name: "", university: "", year: "", challenges: [] })
  const [animating, setAnimating] = useState(false)
  const nameRef = useRef(null)

  const next = (updates) => {
    setAnimating(true)
    setTimeout(() => {
      setData(prev => ({ ...prev, ...updates }))
      setStep(s => s + 1)
      setAnimating(false)
    }, 300)
  }

  const cls = `flex flex-col items-center justify-center h-full px-8 text-center transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{background:"#F7FFF9"}}>
      <div className="w-full max-w-lg h-full flex items-center justify-center">

        {step === 0 && (
          <div className={cls}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{background:"#00C896"}}>
              <span className="text-white font-black text-3xl">CH</span>
            </div>
            <h1 className="text-4xl font-black mb-3" style={{color:"#0F1117"}}>ClearHead</h1>
            <p className="text-lg mb-2" style={{color:"#8B9099"}}>Your personal student life advisor.</p>
            <p className="text-sm mb-10 max-w-xs" style={{color:"#8B9099"}}>Not a bot. Not generic advice. A friend who actually gets student life.</p>
            <button onClick={() => next({})} className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition hover:scale-105 active:scale-95" style={{background:"#00C896"}}>
              Let's get started →
            </button>
            <p className="text-xs mt-4" style={{color:"#8B9099"}}>Takes 30 seconds. No sign up needed.</p>
          </div>
        )}

        {step === 1 && (
          <div className={cls}>
            <p className="text-sm font-medium mb-2" style={{color:"#00C896"}}>STEP 1 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{color:"#0F1117"}}>What do your friends call you?</h2>
            <p className="text-sm mb-8" style={{color:"#8B9099"}}>ClearHead will use this throughout your conversations.</p>
            <input
              ref={nameRef}
              autoFocus
              className="w-full max-w-sm px-5 py-4 rounded-2xl text-lg font-medium outline-none border-2 transition text-center"
              style={{borderColor:"#00C896", color:"#0F1117", background:"white"}}
              placeholder="Your name..."
              onKeyDown={e => {
                if (e.key === "Enter" && e.target.value.trim()) next({ name: e.target.value.trim() })
              }}
            />
            <p className="text-xs mt-3" style={{color:"#8B9099"}}>Press Enter to continue</p>
          </div>
        )}

        {step === 2 && (
          <div className={cls}>
            <p className="text-sm font-medium mb-2" style={{color:"#00C896"}}>STEP 2 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{color:"#0F1117"}}>Which university?</h2>
            <p className="text-sm mb-8" style={{color:"#8B9099"}}>Helps ClearHead understand your academic context.</p>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {UNIVERSITIES.map(u => (
                <button key={u} onClick={() => next({ university: u })}
                  className="py-3 px-2 rounded-xl text-sm font-semibold border-2 transition hover:scale-105 active:scale-95"
                  style={{borderColor:"#00C896", color:"#0F1117", background:"white"}}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={cls}>
            <p className="text-sm font-medium mb-2" style={{color:"#00C896"}}>STEP 3 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{color:"#0F1117"}}>What year are you in?</h2>
            <p className="text-sm mb-8" style={{color:"#8B9099"}}>Your stage matters for the advice you'll get.</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {YEARS.map(y => (
                <button key={y} onClick={() => next({ year: y })}
                  className="py-4 rounded-2xl text-sm font-semibold border-2 transition hover:scale-105 active:scale-95"
                  style={{borderColor:"#00C896", color:"#0F1117", background:"white"}}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={cls}>
            <p className="text-sm font-medium mb-2" style={{color:"#00C896"}}>STEP 4 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{color:"#0F1117"}}>What's weighing on you?</h2>
            <p className="text-sm mb-6" style={{color:"#8B9099"}}>Pick everything that applies. Be honest.</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
              {CHALLENGES.map(c => {
                const selected = data.challenges.includes(c.id)
                return (
                  <button key={c.id}
                    onClick={() => setData(prev => ({
                      ...prev,
                      challenges: selected
                        ? prev.challenges.filter(x => x !== c.id)
                        : [...prev.challenges, c.id]
                    }))}
                    className="py-3 px-3 rounded-xl text-left border-2 transition hover:scale-105 active:scale-95"
                    style={{
                      borderColor: selected ? "#00C896" : "#e5e7eb",
                      background: selected ? "#f0fdf8" : "white",
                      color: "#0F1117"
                    }}>
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="text-xs mt-0.5" style={{color:"#8B9099"}}>{c.sub}</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => data.challenges.length > 0 && onComplete(data)}
              disabled={data.challenges.length === 0}
              className="px-8 py-4 rounded-2xl text-white font-bold text-base transition hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{background:"#00C896"}}>
              Meet ClearHead →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Clarity Ring ────────────────────────────────────────────
function ClarityRing({ score = 0 }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-18 h-18">
        <svg width="72" height="72" style={{transform:"rotate(-90deg)"}}>
          <circle cx="36" cy="36" r={r} fill="none" stroke="#1e2129" strokeWidth="5"/>
          <circle cx="36" cy="36" r={r} fill="none" stroke="#00C896" strokeWidth="5"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s ease"}}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-white">{score}%</span>
        </div>
      </div>
      <div className="text-xs font-medium mt-1" style={{color:"#8B9099"}}>Clarity Score</div>
    </div>
  )
}

// ── Sidebar ─────────────────────────────────────────────────
function Sidebar({ profile, situation, plan, moodHistory, messageCount }) {
  const clarityScore = Math.min(100, Math.round(
    (messageCount > 0 ? 20 : 0) +
    (situation ? 30 : 0) +
    (plan ? 30 : 0) +
    (moodHistory?.length > 0 ? 20 : 0)
  ))

  const moodEmoji = {
    happy: "😊", anxious: "😰", stressed: "😫",
    lost: "😶", motivated: "💪", burned_out: "🥴", neutral: "😐"
  }
  const lastMood = moodHistory?.[moodHistory.length - 1]

  return (
    <div className="w-72 h-full flex flex-col shrink-0 border-r overflow-y-auto" style={{background:"#0F1117", borderColor:"#1e2129"}}>

      {/* Logo */}
      <div className="px-6 pt-6 pb-4 border-b shrink-0" style={{borderColor:"#1e2129"}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:"#00C896"}}>
            <span className="text-white font-black text-sm">CH</span>
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-none">ClearHead</h1>
            <p className="text-xs mt-0.5" style={{color:"#8B9099"}}>Student Life Advisor</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-6 py-5 border-b shrink-0" style={{borderColor:"#1e2129"}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{background:"#1e2129", color:"#00C896"}}>
            {profile?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{profile?.name || "Student"}</div>
            <div className="text-xs" style={{color:"#8B9099"}}>
              {profile?.university || ""}{profile?.year ? ` · ${profile.year}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Clarity Ring */}
      <div className="px-6 py-5 border-b flex justify-center shrink-0" style={{borderColor:"#1e2129"}}>
        <ClarityRing score={clarityScore} />
      </div>

      {/* Mood */}
      <div className="px-6 py-4 border-b shrink-0" style={{borderColor:"#1e2129"}}>
        <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{color:"#8B9099"}}>Current Mood</p>
        {lastMood ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moodEmoji[lastMood.mood] || "😐"}</span>
            <div>
              <div className="text-sm font-semibold capitalize text-white">{lastMood.mood?.replace("_", " ")}</div>
              <div className="text-xs" style={{color:"#8B9099"}}>{lastMood.note?.slice(0, 45)}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{color:"#8B9099"}}>Not tracked yet — just start talking</p>
        )}
      </div>

      {/* Situation */}
      {situation && (
        <div className="px-6 py-4 border-b shrink-0" style={{borderColor:"#1e2129"}}>
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{color:"#8B9099"}}>Situation</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{color:"#8B9099"}}>Stress Level</span>
                <span className="font-bold text-white">{situation.stress_level}/10</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{background:"#1e2129"}}>
                <div className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width:`${situation.stress_level * 10}%`,
                    background: situation.stress_level > 7 ? "#ef4444" : situation.stress_level > 4 ? "#f59e0b" : "#00C896"
                  }}/>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{color:"#8B9099"}}>Academics</span>
              <span className="font-medium capitalize text-white">{situation.academic_status?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{color:"#8B9099"}}>Finances</span>
              <span className="font-medium capitalize text-white">{situation.financial_stress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Plan */}
      {plan && (
        <div className="px-6 py-4 border-b shrink-0" style={{borderColor:"#1e2129"}}>
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{color:"#8B9099"}}>Active Plan</p>
          <div className="rounded-xl p-3" style={{background:"#1e2129"}}>
            <div className="text-sm font-bold text-white">{plan.timeframe_days} day plan</div>
            <div className="text-xs mt-1 mb-2" style={{color:"#8B9099"}}>{plan.goals?.length} goals · {plan.available_hours_per_day} hrs/day</div>
            <div className="space-y-1.5">
              {plan.goals?.slice(0, 3).map((g, i) => (
                <div key={i} className="text-xs flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{background:"#00C896"}}/>
                  <span style={{color:"#8B9099"}} className="leading-relaxed">{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenges */}
      {profile?.challenges?.length > 0 && (
        <div className="px-6 py-4 border-b shrink-0" style={{borderColor:"#1e2129"}}>
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{color:"#8B9099"}}>Focusing On</p>
          <div className="flex flex-wrap gap-2">
            {profile.challenges.map(c => {
              const ch = CHALLENGES.find(x => x.id === c)
              return ch ? (
                <span key={c} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:"#1e2129", color:"#00C896"}}>
                  {ch.label}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Online indicator */}
      <div className="mt-auto px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{background:"#00C896"}}/>
          <span className="text-xs" style={{color:"#8B9099"}}>ClearHead is online</span>
        </div>
      </div>
    </div>
  )
}

// ── Message ─────────────────────────────────────────────────
function Message({ msg, isNew }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex items-end gap-3 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={isNew ? {animation:"slideIn 0.3s ease forwards"} : {}}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mb-1" style={{background:"#00C896"}}>
          CH
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
          style={isUser
            ? {background:"#00C896", color:"white"}
            : {background:"white", color:"#0F1117", border:"1px solid #f0f0f0", boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}
          }>
          {msg.content}
        </div>
        <span className="text-xs px-1" style={{color:"#8B9099"}}>{formatTime(msg.time || new Date())}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{background:"#00C896"}}>
        CH
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{background:"white", border:"1px solid #f0f0f0", boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map(d => (
            <span key={d} className="w-2 h-2 rounded-full animate-bounce"
              style={{background:"#00C896", animationDelay:`${d}ms`}}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Plan Banner ─────────────────────────────────────────────
function PlanBanner({ plan, onExport }) {
  if (!plan) return null
  return (
    <div className="mx-4 mt-3 mb-1 rounded-2xl overflow-hidden shadow-sm shrink-0" style={{border:"1px solid #d1fae5"}}>
      <div className="px-4 py-3 flex items-center justify-between" style={{background:"#00C896"}}>
        <div className="flex items-center gap-2">
          <span className="text-white text-base">📋</span>
          <span className="text-white font-bold text-sm">Action Plan Ready</span>
        </div>
        <button onClick={onExport}
          className="text-xs px-3 py-1.5 rounded-full font-semibold transition hover:opacity-90 active:scale-95"
          style={{background:"white", color:"#00C896"}}>
          Export PDF
        </button>
      </div>
      <div className="px-4 py-2.5 flex gap-6 text-sm" style={{background:"#f0fdf8"}}>
        <div>
          <span className="font-semibold" style={{color:"#065f46"}}>{plan.timeframe_days} days</span>
          <span className="text-xs ml-1" style={{color:"#8B9099"}}>timeframe</span>
        </div>
        <div>
          <span className="font-semibold" style={{color:"#065f46"}}>{plan.available_hours_per_day} hrs/day</span>
          <span className="text-xs ml-1" style={{color:"#8B9099"}}>commitment</span>
        </div>
        <div>
          <span className="font-semibold" style={{color:"#065f46"}}>{plan.goals?.length}</span>
          <span className="text-xs ml-1" style={{color:"#8B9099"}}>goals</span>
        </div>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(!!localStorage.getItem("clearhead_profile"))
  const [profile, setProfile] = useState(() => {
    const p = localStorage.getItem("clearhead_profile")
    return p ? JSON.parse(p) : null
  })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [situation, setSituation] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [newMsgIdx, setNewMsgIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const handleOnboardComplete = (data) => {
    localStorage.setItem("clearhead_profile", JSON.stringify(data))
    setProfile(data)
    setOnboarded(true)
  }

  useEffect(() => {
    if (!onboarded) return
    setLoading(true)
    fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: SESSION_ID, message: "__init__", profile })
    })
      .then(r => r.json())
      .then(data => {
        const msg = { role: "assistant", content: data.response, time: new Date() }
        setMessages([msg])
        setNewMsgIdx(0)
        if (data.plan) setPlan(data.plan)
        if (data.situation) setSituation(data.situation)
        if (data.mood_history) setMoodHistory(data.mood_history)
      })
      .finally(() => setLoading(false))
  }, [onboarded])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => {
      setNewMsgIdx(prev.length)
      return [...prev, { role: "user", content: userMsg, time: new Date() }]
    })
    setLoading(true)
    setMessageCount(c => c + 1)

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: userMsg, profile })
      })
      const data = await res.json()
      setMessages(prev => {
        setNewMsgIdx(prev.length)
        return [...prev, { role: "assistant", content: data.response, time: new Date() }]
      })
      if (data.plan) setPlan(data.plan)
      if (data.situation) setSituation(data.situation)
      if (data.mood_history) setMoodHistory(data.mood_history)
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Yaar connection issue, dobara try karo.",
        time: new Date()
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleExport = () => {
    if (!plan) return
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF()
      const green = [0, 200, 150]
      const dark = [15, 17, 23]
      const gray = [139, 144, 153]
      const lightGreen = [240, 253, 248]

      doc.setFillColor(...green)
      doc.rect(0, 0, 210, 45, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(26)
      doc.setFont("helvetica", "bold")
      doc.text("ClearHead", 14, 22)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Personalized Action Plan", 14, 32)
      doc.setFontSize(9)
      doc.text(`${profile?.name || "Student"} · ${profile?.university || ""} · ${new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}`, 14, 40)

      doc.setTextColor(...dark)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Plan Overview", 14, 58)
      doc.setDrawColor(...green)
      doc.setLineWidth(0.8)
      doc.line(14, 61, 196, 61)

      const cards = [
        { label: "TIMEFRAME", value: `${plan.timeframe_days} days` },
        { label: "DAILY HOURS", value: `${plan.available_hours_per_day} hrs` },
        { label: "GOALS", value: `${plan.goals?.length || 0}` },
      ]
      cards.forEach((card, i) => {
        const x = 14 + i * 62
        doc.setFillColor(...lightGreen)
        doc.roundedRect(x, 66, 56, 24, 3, 3, "F")
        doc.setFontSize(8)
        doc.setTextColor(...gray)
        doc.setFont("helvetica", "normal")
        doc.text(card.label, x + 4, 74)
        doc.setFontSize(14)
        doc.setTextColor(...dark)
        doc.setFont("helvetica", "bold")
        doc.text(card.value, x + 4, 84)
      })

      let y = 108
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...dark)
      doc.text("Your Goals", 14, y)
      doc.setDrawColor(...green)
      doc.line(14, y + 3, 196, y + 3)
      y += 13

      plan.goals?.forEach((goal, i) => {
        doc.setFillColor(...green)
        doc.circle(19, y - 1.5, 4, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text(`${i + 1}`, i < 9 ? 17.5 : 16.5, y - 0.2)
        doc.setTextColor(...dark)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(goal, 162)
        doc.text(lines, 27, y)
        y += lines.length * 7 + 5
        if (y > 260) { doc.addPage(); y = 20 }
      })

      if (plan.constraints) {
        y += 4
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...dark)
        doc.text("Constraints & Context", 14, y)
        doc.setDrawColor(...green)
        doc.line(14, y + 3, 196, y + 3)
        y += 12
        doc.setFillColor(...lightGreen)
        const cl = doc.splitTextToSize(plan.constraints, 170)
        doc.roundedRect(14, y - 5, 182, cl.length * 7 + 8, 3, 3, "F")
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...gray)
        doc.text(cl, 20, y + 1)
        y += cl.length * 7 + 12
      }

      doc.setFillColor(...green)
      doc.roundedRect(14, y + 4, 182, 28, 3, 3, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text("What's next?", 22, y + 14)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Open ClearHead daily. Check in. Small steps, consistent effort.", 22, y + 23)
      doc.text("You've got this.", 22, y + 29)

      doc.setFillColor(...green)
      doc.rect(0, 282, 210, 15, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text("ClearHead — Student Life Advisor", 14, 291)
      doc.text("Your clarity starts here.", 152, 291)

      doc.save(`clearhead_plan_${profile?.name || "student"}.pdf`)
    })
  }

  if (!onboarded) return <Onboarding onComplete={handleOnboardComplete} />

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{background:"#f8fffe"}}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          profile={profile}
          situation={situation}
          plan={plan}
          moodHistory={moodHistory}
          messageCount={messageCount}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{background:"#0F1117", borderColor:"#1e2129"}}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:"#00C896"}}>
            <span className="text-white font-black text-xs">CH</span>
          </div>
          <div>
            <h1 className="text-white font-black text-sm leading-none">ClearHead</h1>
            <p className="text-xs mt-0.5" style={{color:"#8B9099"}}>Hey {profile?.name} 👋</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{background:"#00C896"}}/>
        </div>

        {/* Plan banner */}
        {plan && <PlanBanner plan={plan} onExport={handleExport} />}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} isNew={i === newMsgIdx} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 border-t shrink-0" style={{background:"white", borderColor:"#f0f0f0"}}>
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition max-h-32 border"
              style={{borderColor:"#e5e7eb", color:"#0F1117", background:"#f9fafb"}}
              onFocus={e => e.target.style.borderColor = "#00C896"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              placeholder={profile?.name ? `Batao ${profile.name}, kya chal raha hai...` : "Tell me what's going on..."}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-2xl px-5 py-3 text-sm font-bold transition hover:opacity-90 active:scale-95 disabled:opacity-40 shrink-0 text-white"
              style={{background:"#00C896"}}>
              Send
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{color:"#8B9099"}}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}