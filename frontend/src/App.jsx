import { useState, useEffect, useRef } from "react"

const SESSION_ID = (() => {
  const stored = localStorage.getItem("clearhead_session")
  if (stored) return stored
  const id = Math.random().toString(36).substring(2, 9)
  localStorage.setItem("clearhead_session", id)
  return id
})()

const API = "http://localhost:5000"

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div style={{background:"#00C896"}} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
        CH
      </div>
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full animate-bounce" style={{background:"#00C896", animationDelay:"0ms"}}/>
          <span className="w-2 h-2 rounded-full animate-bounce" style={{background:"#00C896", animationDelay:"150ms"}}/>
          <span className="w-2 h-2 rounded-full animate-bounce" style={{background:"#00C896", animationDelay:"300ms"}}/>
        </div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div style={{background:"#00C896"}} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
          CH
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
          ${isUser
            ? "text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
          }`}
          style={isUser ? {background:"#00C896"} : {}}>
          {msg.content}
        </div>
        <span className="text-xs text-gray-400 px-1">{formatTime(msg.time || new Date())}</span>
      </div>
    </div>
  )
}

function PlanCard({ plan, onExport }) {
  if (!plan) return null
  return (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm border border-emerald-100">
      <div style={{background:"#00C896"}} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">📋</span>
          <h3 className="font-semibold text-white text-sm">Your Action Plan</h3>
        </div>
        <button
          onClick={onExport}
          className="text-xs bg-white px-3 py-1 rounded-full font-medium transition hover:opacity-90"
          style={{color:"#00C896"}}>
          Export PDF
        </button>
      </div>
      <div className="bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-1">
        <div><span className="font-medium">Timeframe:</span> {plan.timeframe_days} days</div>
        <div><span className="font-medium">Daily time:</span> {plan.available_hours_per_day} hrs/day</div>
        <div>
          <span className="font-medium">Goals:</span>
          <ul className="mt-1 ml-3 space-y-0.5">
            {plan.goals?.map((g, i) => <li key={i}>• {g}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [userName, setUserName] = useState("")
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: SESSION_ID, message: "__init__" })
    })
      .then(r => r.json())
      .then(data => {
        setMessages([{ role: "assistant", content: data.response, time: new Date() }])
        if (data.plan) setPlan(data.plan)
        if (data.name) setUserName(data.name)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg, time: new Date() }])
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response, time: new Date() }])
      if (data.plan) setPlan(data.plan)
      if (data.name) setUserName(data.name)
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Yaar connection issue lag raha hai, dobara try karo.", time: new Date() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleExport = () => {
  if (!plan) return

  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF()
    const green = [0, 200, 150]
    const dark = [30, 30, 30]
    const gray = [100, 100, 100]
    const lightGreen = [240, 253, 248]

    // Header
    doc.setFillColor(...green)
    doc.rect(0, 0, 210, 45, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(26)
    doc.setFont("helvetica", "bold")
    doc.text("ClearHead", 14, 22)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Student Life Advisor — Personalized Action Plan", 14, 32)
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleDateString("en-PK", { dateStyle: "long" })}`, 14, 40)

    // Overview cards
    doc.setTextColor(...dark)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Plan Overview", 14, 58)
    doc.setDrawColor(...green)
    doc.setLineWidth(0.8)
    doc.line(14, 61, 196, 61)

    // Three cards
    const cards = [
      { label: "TIMEFRAME", value: `${plan.timeframe_days} days` },
      { label: "DAILY HOURS", value: `${plan.available_hours_per_day} hrs` },
      { label: "TOTAL GOALS", value: `${plan.goals?.length || 0}` },
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

    // Goals
    let y = 108
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...dark)
    doc.text("Your Goals", 14, y)
    doc.setDrawColor(...green)
    doc.line(14, y + 3, 196, y + 3)
    y += 13

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    plan.goals?.forEach((goal, i) => {
      // Goal number circle
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

      if (y > 260) {
        doc.addPage()
        y = 20
      }
    })

    // Constraints
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
      const constraintLines = doc.splitTextToSize(plan.constraints, 170)
      doc.roundedRect(14, y - 5, 182, constraintLines.length * 7 + 8, 3, 3, "F")
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...gray)
      doc.text(constraintLines, 20, y + 1)
      y += constraintLines.length * 7 + 12
    }

    // Next steps box
    y += 4
    doc.setFillColor(...green)
    doc.roundedRect(14, y, 182, 28, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Next Step", 22, y + 10)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Open ClearHead daily. Check in on your progress.", 22, y + 19)
    doc.text("Small consistent steps beat big occasional bursts.", 22, y + 25)

    // Footer
    doc.setFillColor(...green)
    doc.rect(0, 282, 210, 15, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("ClearHead — Student Life Advisor", 14, 291)
    doc.text("clearhead.app", 170, 291)

    doc.save("clearhead_plan.pdf")
  })
}

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{background:"#f0fdf8"}}>

      {/* Header */}
      <div style={{background:"#00C896"}} className="flex items-center gap-3 px-6 py-4 shadow-md shrink-0">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
          <span style={{color:"#00C896"}} className="font-bold text-sm">CH</span>
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg leading-none">ClearHead</h1>
          <p className="text-emerald-100 text-xs mt-0.5">Student Life Advisor</p>
        </div>
        {userName && (
          <div className="text-emerald-100 text-sm font-medium">
            Hey, {userName} 👋
          </div>
        )}
        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" title="Online"/>
      </div>

      {/* Plan card */}
      {plan && <PlanCard plan={plan} onExport={handleExport} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4 bg-white border-t border-gray-100 shadow-inner">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none transition max-h-32 bg-gray-50"
            style={{"--tw-ring-color":"#00C896"}}
            onFocus={e => e.target.style.borderColor="#00C896"}
            onBlur={e => e.target.style.borderColor="#e5e7eb"}
            placeholder={userName ? `Batao ${userName}, kya chal raha hai...` : "Tell me what's going on..."}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="text-white rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40 shrink-0"
            style={{background: loading || !input.trim() ? "#9ca3af" : "#00C896"}}>
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}