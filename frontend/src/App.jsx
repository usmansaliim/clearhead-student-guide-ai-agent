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

const DEPARTMENTS = ["BSCS", "BSSE", "BSAI", "BSEE", "BSCY", "BSIT", "BSDS", "BSCE", "Other"]
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ── Onboarding ──────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ name: "", department: "", year: "", semester: "", challenges: [] })
  const [animating, setAnimating] = useState(false)

  const next = (updates) => {
    setAnimating(true)
    setTimeout(() => {
      setData(prev => ({ ...prev, ...updates }))
      setStep(s => s + 1)
      setAnimating(false)
    }, 250)
  }

  const cls = `flex flex-col items-center justify-center h-full px-8 text-center transition-all duration-250 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: "#F0FDF8" }}>
      <div className="w-full max-w-lg h-full flex items-center justify-center">

        {step === 0 && (
          <div className={cls}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ background: "#00C896" }}>
              <span className="text-white font-black text-3xl">CH</span>
            </div>
            <h1 className="text-4xl font-black mb-2" style={{ color: "#0F1117" }}>ClearHead</h1>
            <p className="text-base font-semibold mb-1" style={{ color: "#00C896" }}>Built for NUST Students</p>
            <p className="text-sm mb-10 max-w-xs" style={{ color: "#8B9099" }}>
              Your personal advisor who actually understands NUST — the grading system, the pressure, the chaos, and how to get through it.
            </p>
            <button onClick={() => next({})}
              className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition hover:scale-105 active:scale-95"
              style={{ background: "#00C896" }}>
              Let's go →
            </button>
            <p className="text-xs mt-4" style={{ color: "#8B9099" }}>30 seconds. No sign up needed.</p>
          </div>
        )}

        {step === 1 && (
          <div className={cls}>
            <p className="text-xs font-bold mb-2 tracking-widest" style={{ color: "#00C896" }}>STEP 1 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0F1117" }}>What's your name?</h2>
            <p className="text-sm mb-8" style={{ color: "#8B9099" }}>ClearHead will talk to you like a friend, not a system.</p>
            <input
              autoFocus
              className="w-full max-w-sm px-5 py-4 rounded-2xl text-lg font-medium outline-none border-2 transition text-center bg-white"
              style={{ borderColor: "#00C896", color: "#0F1117" }}
              placeholder="Muhammad Usman Saleem"
              onKeyDown={e => e.key === "Enter" && e.target.value.trim() && next({ name: e.target.value.trim() })}
            />
            <p className="text-xs mt-3" style={{ color: "#8B9099" }}>Press Enter to continue</p>
          </div>
        )}

        {step === 2 && (
          <div className={cls}>
            <p className="text-xs font-bold mb-2 tracking-widest" style={{ color: "#00C896" }}>STEP 2 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0F1117" }}>Your department?</h2>
            <p className="text-sm mb-6" style={{ color: "#8B9099" }}>Helps ClearHead give you the right academic context.</p>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {DEPARTMENTS.map(d => (
                <button key={d} onClick={() => next({ department: d })}
                  className="py-3 px-2 rounded-xl text-sm font-bold border-2 transition hover:scale-105 active:scale-95 bg-white"
                  style={{ borderColor: "#00C896", color: "#0F1117" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={cls}>
            <p className="text-xs font-bold mb-2 tracking-widest" style={{ color: "#00C896" }}>STEP 3 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0F1117" }}>Year & Semester?</h2>
            <p className="text-sm mb-6" style={{ color: "#8B9099" }}>Your stage matters — advice for 1st year is very different from 4th year.</p>
            <div className="w-full max-w-sm space-y-4">
              <div>
                <p className="text-xs font-semibold mb-2 text-left" style={{ color: "#8B9099" }}>YEAR</p>
                <div className="grid grid-cols-2 gap-2">
                  {YEARS.map(y => (
                    <button key={y} onClick={() => setData(prev => ({ ...prev, year: y }))}
                      className="py-3 rounded-xl text-sm font-bold border-2 transition hover:scale-105 active:scale-95"
                      style={{
                        borderColor: data.year === y ? "#00C896" : "#e5e7eb",
                        background: data.year === y ? "#f0fdf8" : "white",
                        color: "#0F1117"
                      }}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 text-left" style={{ color: "#8B9099" }}>SEMESTER</p>
                <div className="grid grid-cols-4 gap-2">
                  {SEMESTERS.map(s => (
                    <button key={s} onClick={() => setData(prev => ({ ...prev, semester: s }))}
                      className="py-2.5 rounded-xl text-xs font-bold border-2 transition hover:scale-105 active:scale-95"
                      style={{
                        borderColor: data.semester === s ? "#00C896" : "#e5e7eb",
                        background: data.semester === s ? "#f0fdf8" : "white",
                        color: "#0F1117"
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => data.year && data.semester && next({})}
                disabled={!data.year || !data.semester}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ background: "#00C896" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={cls}>
            <p className="text-xs font-bold mb-2 tracking-widest" style={{ color: "#00C896" }}>STEP 4 OF 4</p>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0F1117" }}>What's weighing on you?</h2>
            <p className="text-sm mb-6" style={{ color: "#8B9099" }}>Pick everything that applies. Be honest.</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-5">
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
                    <div className="text-sm font-bold">{c.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#8B9099" }}>{c.sub}</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => data.challenges.length > 0 && onComplete(data)}
              disabled={data.challenges.length === 0}
              className="px-8 py-4 rounded-2xl text-white font-bold text-base transition hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: "#00C896" }}>
              Meet ClearHead →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Sidebar ─────────────────────────────────────────────────
function Sidebar({ profile, situation, plan, moodHistory }) {
  const moodEmoji = {
    happy: "😊", anxious: "😰", stressed: "😫",
    lost: "😶", motivated: "💪", burned_out: "🥴", neutral: "😐"
  }
  const lastMood = moodHistory?.[moodHistory.length - 1]
  const stressColor = situation?.stress_level > 7 ? "#ef4444" : situation?.stress_level > 4 ? "#f59e0b" : "#00C896"

  return (
    <div className="w-64 h-full flex flex-col shrink-0 border-r overflow-y-auto"
      style={{ background: "#0F1117", borderColor: "#1e2129" }}>

      <div className="px-5 pt-6 pb-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#00C896" }}>
            <span className="text-white font-black text-xs">CH</span>
          </div>
          <div>
            <h1 className="text-white font-black text-sm leading-none">ClearHead</h1>
            <p className="text-xs mt-0.5" style={{ color: "#00C896" }}>University Edition</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
            style={{ background: "#1e2129", color: "#00C896" }}>
            {profile?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm truncate">{profile?.name || "Student"}</div>
            <div className="text-xs truncate" style={{ color: "#8B9099" }}>
              NUST · {profile?.department || ""} · {profile?.semester || ""}
            </div>
          </div>
        </div>
      </div>

      {situation && (
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: "#8B9099" }}>SNAPSHOT</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#8B9099" }}>Stress</span>
                <span className="font-bold" style={{ color: stressColor }}>{situation.stress_level}/10</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: "#1e2129" }}>
                <div className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${situation.stress_level * 10}%`, background: stressColor }} />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#8B9099" }}>Academics</span>
              <span className="font-semibold capitalize text-white">{situation.academic_status?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#8B9099" }}>Finances</span>
              <span className="font-semibold capitalize text-white">{situation.financial_stress}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
        <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: "#8B9099" }}>CURRENT MOOD</p>
        {lastMood ? (
          <div className="flex items-start gap-2">
            <span className="text-2xl shrink-0">{moodEmoji[lastMood.mood] || "😐"}</span>
            <div className="min-w-0">
              <div className="text-sm font-bold capitalize text-white">{lastMood.mood?.replace("_", " ")}</div>
              <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#8B9099" }}>
                {lastMood.note?.slice(0, 60)}{lastMood.note?.length > 60 ? "..." : ""}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs" style={{ color: "#8B9099" }}>Start talking — ClearHead picks up on how you feel.</p>
        )}
      </div>

      {plan && (
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: "#8B9099" }}>ACTIVE PLAN</p>
          <div className="rounded-xl p-3" style={{ background: "#1e2129" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">{plan.timeframe_days} day plan</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#00C896", color: "white" }}>Active</span>
            </div>
            <div className="text-xs mb-2" style={{ color: "#8B9099" }}>{plan.available_hours_per_day} hrs/day · {plan.goals?.length} goals</div>
            <div className="space-y-1.5">
              {plan.goals?.slice(0, 3).map((g, i) => (
                <div key={i} className="text-xs flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: "#00C896" }} />
                  <span style={{ color: "#8B9099" }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {profile?.challenges?.length > 0 && (
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: "#8B9099" }}>FOCUSING ON</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.challenges.map(c => {
              const ch = CHALLENGES.find(x => x.id === c)
              return ch ? (
                <span key={c} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: "#1e2129", color: "#00C896" }}>
                  {ch.label}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#1e2129" }}>
        <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: "#8B9099" }}>NUST QUICK LINKS</p>
        <div className="space-y-2">
          {[
            { label: "Qalam Portal", url: "https://qalam.nust.edu.pk" },
            { label: "NUST Website", url: "https://nust.edu.pk" },
            { label: "NSTP", url: "https://nstp.pk" },
            { label: "r/NUST", url: "https://reddit.com/r/NUST" },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition hover:opacity-80"
              style={{ color: "#8B9099", background: "#1e2129" }}>
              <span>{link.label}</span>
              <span style={{ color: "#00C896" }}>↗</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00C896" }} />
          <span className="text-xs" style={{ color: "#8B9099" }}>ClearHead is online</span>
        </div>
        <p className="text-xs mt-1" style={{ color: "#2a2f38" }}>v1.0 · NUST Edition</p>
      </div>
    </div>
  )
}

// ── Message ─────────────────────────────────────────────────
function Message({ msg, isNew }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex items-end gap-3 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={isNew ? { animation: "slideIn 0.3s ease forwards" } : {}}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mb-1"
          style={{ background: "#00C896" }}>
          CH
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {msg.image && (
          <img src={msg.image} alt="attachment"
            className="rounded-2xl max-h-48 w-auto object-cover mb-1"
            style={{ border: "2px solid #00C896" }} />
        )}
        {msg.content && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
            style={isUser
              ? { background: "#00C896", color: "white" }
              : { background: "white", color: "#0F1117", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
            }>
            {msg.content}
          </div>
        )}
        <span className="text-xs px-1" style={{ color: "#8B9099" }}>{formatTime(msg.time || new Date())}</span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
        style={{ background: "#00C896" }}>
        CH
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: "white", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map(d => (
            <span key={d} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#00C896", animationDelay: `${d}ms` }} />
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
    <div className="mx-4 mt-3 mb-1 rounded-2xl overflow-hidden shadow-sm shrink-0" style={{ border: "1px solid #d1fae5" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#00C896" }}>
        <div className="flex items-center gap-2">
          <span className="text-white">📋</span>
          <span className="text-white font-bold text-sm">Action Plan Ready</span>
        </div>
        <button onClick={onExport}
          className="text-xs px-3 py-1.5 rounded-full font-bold transition hover:opacity-90 active:scale-95"
          style={{ background: "white", color: "#00C896" }}>
          Export PDF
        </button>
      </div>
      <div className="px-4 py-2.5 flex gap-6 text-sm" style={{ background: "#f0fdf8" }}>
        <div><span className="font-bold" style={{ color: "#065f46" }}>{plan.timeframe_days} days</span></div>
        <div><span className="font-bold" style={{ color: "#065f46" }}>{plan.available_hours_per_day} hrs/day</span></div>
        <div><span className="font-bold" style={{ color: "#065f46" }}>{plan.goals?.length}</span><span className="text-xs ml-1" style={{ color: "#8B9099" }}>goals</span></div>
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
  const [newMsgIdx, setNewMsgIdx] = useState(-1)
  const [attachedImage, setAttachedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

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
        setMessages([{ role: "assistant", content: data.response, time: new Date() }])
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

  const handleImageAttach = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target.result)
      setAttachedImage({
        data: ev.target.result.split(",")[1],
        type: file.type,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setAttachedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const send = async () => {
    if (!input.trim() && !attachedImage) return
    if (loading) return

    const userMsg = input.trim()
    const imgPreview = imagePreview
    setInput("")
    setAttachedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    setMessages(prev => {
      setNewMsgIdx(prev.length)
      return [...prev, { role: "user", content: userMsg, image: imgPreview, time: new Date() }]
    })
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION_ID,
          message: userMsg || "I've sent you an image, please analyze it.",
          profile,
          image: attachedImage
        })
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
      setMessages(prev => [...prev, { role: "assistant", content: "Yaar connection issue, dobara try karo.", time: new Date() }])
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
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("ClearHead", 14, 20)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("NUST Edition — Personalized Action Plan", 14, 30)
      doc.text(`${profile?.name || "Student"} · NUST ${profile?.department || ""} · ${profile?.semester || ""} · ${new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}`, 14, 39)

      doc.setTextColor(...dark)
      doc.setFontSize(13)
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
        doc.setFontSize(13)
        doc.setTextColor(...dark)
        doc.setFont("helvetica", "bold")
        doc.text(card.value, x + 4, 84)
      })

      let y = 108
      doc.setFontSize(13)
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

      doc.setFillColor(...green)
      doc.roundedRect(14, y + 4, 182, 24, 3, 3, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("What's next?", 22, y + 13)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("Open ClearHead daily. Small consistent steps beat big occasional bursts.", 22, y + 21)

      doc.setFillColor(...green)
      doc.rect(0, 282, 210, 15, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text("ClearHead — NUST Edition", 14, 291)
      doc.text("Your clarity starts here.", 155, 291)

      doc.save(`clearhead_${profile?.name?.split(" ")[0] || "plan"}.pdf`)
    })
  }

  if (!onboarded) return <Onboarding onComplete={handleOnboardComplete} />

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#f8fffe" }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hidden md:block">
        <Sidebar profile={profile} situation={situation} plan={plan} moodHistory={moodHistory} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ background: "#0F1117", borderColor: "#1e2129" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#00C896" }}>
            <span className="text-white font-black text-xs">CH</span>
          </div>
          <div>
            <h1 className="text-white font-black text-sm leading-none">ClearHead</h1>
            <p className="text-xs mt-0.5" style={{ color: "#00C896" }}>NUST Edition</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00C896" }} />
            <span className="text-xs" style={{ color: "#8B9099" }}>Online</span>
          </div>
        </div>

        {plan && <PlanBanner plan={plan} onExport={handleExport} />}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} isNew={i === newMsgIdx} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-4 border-t shrink-0" style={{ background: "white", borderColor: "#f0f0f0" }}>

          {imagePreview && (
            <div className="max-w-3xl mx-auto mb-3">
              <div className="relative inline-block">
                <img src={imagePreview} alt="attachment"
                  className="h-20 w-auto rounded-xl object-cover"
                  style={{ border: "2px solid #00C896" }} />
                <button onClick={removeImage}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shadow"
                  style={{ background: "#ef4444" }}>
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageAttach}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-3 border transition hover:opacity-80 shrink-0 text-lg"
              style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}
              title="Attach image">
              📎
            </button>
            <textarea
              ref={inputRef}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition max-h-32 border"
              style={{ borderColor: "#e5e7eb", color: "#0F1117", background: "#f9fafb" }}
              onFocus={e => e.target.style.borderColor = "#00C896"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              placeholder={profile?.name ? `Batao ${profile.name.split(" ")[0]}, kya chal raha hai...` : "Tell me what's going on..."}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={send}
              disabled={loading || (!input.trim() && !attachedImage)}
              className="rounded-2xl px-5 py-3 text-sm font-bold transition hover:opacity-90 active:scale-95 disabled:opacity-40 shrink-0 text-white"
              style={{ background: "#00C896" }}>
              Send
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "#8B9099" }}>
            Enter to send · Shift+Enter for new line · 📎 attach image
          </p>
        </div>
      </div>
    </div>
  )
}