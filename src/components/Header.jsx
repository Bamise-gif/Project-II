import React from "react"
import { Bell, Moon, Sun } from "lucide-react"

/*Updated to include hamburger toggle button for mobile
Pass onMenuOpen from App.jsx*/

function Header({ currentScreen, currentUser, onMenuOpen, theme, onThemeToggle }) {
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
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" aria-label="Toggle theme" onClick={onThemeToggle}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="avatar-chip">
          <div className="avatar-circle">A</div>
          <span className="avatar-name">{currentUser?.username || "Admin"}</span>
        </div>
      </div>
    </header>
  )
}

export default Header


