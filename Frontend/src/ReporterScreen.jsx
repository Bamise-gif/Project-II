import { useState } from "react"

function ReporterScreen({ currentUser, onLogout }) {
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Plumbing")
  const [urgency, setUrgency] = useState("Soon")
  const [submitted, setSubmitted] = useState(false)
  const [recentReports, setRecentReports] = useState([])

  const categories = ["Electrical", "Plumbing", "HVAC / Temp", "Structural", "Cleaning", "Other"]
  const urgencyLevels = ["Can wait", "Soon", "Urgent / Safety"]

  function handleSubmit() {
    if (!location || !description) {
      alert("Please fill in the location and description.")
      return
    }
    fetch("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, category, description, urgency, status: "Pending" })
    })
      .then((r) => r.json())
      .then(() => {
        setRecentReports([
          { title: description, status: "Just now · Pending" },
          ...recentReports
        ])
        setDescription("")
        setLocation("")
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
      })
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FA",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 16px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "white",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden"
      }}>
        <div style={{
          background: "#1E3A5F",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>Report an Issue</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
              {currentUser?.username} · Reporter
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {submitted && (
            <div style={{
              background: "#F0FDF4",
              border: "1px solid #16A34A",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              color: "#16A34A",
              fontWeight: 600,
              fontSize: "13px"
            }}>
              ✅ Report submitted successfully!
            </div>
          )}

          <div className="field">
            <label>Where is the problem?</label>
            <input
              type="text"
              placeholder="Building, floor, or room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="field">
            <label>What kind of issue?</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    borderColor: category === c ? "#1E3A5F" : "#E5E7EB",
                    background: category === c ? "#1E3A5F" : "white",
                    color: category === c ? "white" : "#6B7280"
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Describe what's happening</label>
            <textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label>How urgent is this?</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {urgencyLevels.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    flex: 1,
                    borderColor: urgency === u ? "#1E3A5F" : "#E5E7EB",
                    background: urgency === u ? "#1E3A5F" : "white",
                    color: urgency === u ? "white" : "#6B7280"
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
            {urgency === "Urgent / Safety" && (
              <div style={{ fontSize: "11.5px", color: "#DC2626", marginTop: "6px" }}>
                ⚠️ Safety hazards are routed immediately to on-call staff.
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "12px",
              background: "#1E3A5F",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "4px"
            }}
          >
            Submit Report
          </button>

          {recentReports.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>
                Your Recent Reports
              </div>
              {recentReports.map((r, i) => (
                <div key={i} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{r.title}</div>
                    <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "2px" }}>{r.status}</div>
                  </div>
                  <span style={{
                    background: "#FFFBEB",
                    color: "#D97706",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "20px"
                  }}>Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "16px", fontSize: "11px", color: "#9CA3AF" }}>
        © 2025 Smart University · Facility Predictive Maintenance
      </div>
    </div>
  )
}

export default ReporterScreen