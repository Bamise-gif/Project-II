import React from "react"

export default function Header() {
  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          🏛️ Smart University
        </div>
        <div style={{ fontSize: 12, color: "#6B7A88" }}>Facility Predictive Maintenance</div>
      </div>

      <div className="right">
        <div className="notif">
          <button className="btn" style={{ position: "relative" }}>🔔
            <span className="badge">3</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="avatar">A</div>
          <div style={{ fontWeight: 600 }}>Admin ▾</div>
        </div>
      </div>
    </div>
  )
}
