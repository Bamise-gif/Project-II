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

/*Updated to include hamburger toggle button for mobile
Pass onMenuOpen from App.jsx*/

function Header({ currentScreen, onMenuOpen }) {
  const SCREEN_TITLES = {
    dashboard:   "Dashboard",
    equipment:   "Equipment",
    monitoring:  "Live Monitoring",
    predictions: "Predictions",
    alerts:      "Alerts",
    maintenance: "Maintenance",
    reports:     "Reports",
    settings:    "Settings",
  }

  return (
    <header className="topbar">

      {/* Hamburger — visible on mobile only */}
     
      <button
        className="hamburger-btn"
        onClick={onMenuOpen}
        aria-label="Open menu"
        aria-expanded="false"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <div className="topbar-title">
        {SCREEN_TITLES[currentScreen] || "Dashboard"}
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Notifications">
          <span className="notif-dot" />
        </button>
        <div className="avatar-chip">
          <div className="avatar-circle">A</div>
          <span className="avatar-name">Admin</span>
        </div>
      </div>
    </header>
  )
}

export default Header


