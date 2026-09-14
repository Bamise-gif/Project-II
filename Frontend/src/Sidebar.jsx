import { Home, HardDrive, Activity, BarChart3, Bell, Wrench, FileText, Settings, LogOut, X } from "lucide-react"
import logo from "./images/logo.png"

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "equipment", label: "Equipment", icon: HardDrive },
  { id: "monitoring", label: "Live Monitoring", icon: Activity },
  { id: "predictions", label: "Predictions", icon: BarChart3 },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings }
]

function Sidebar({ currentSection, onNavigate, onLogout, isOpen, onClose }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="brand">
        <img src={logo} alt="AAUA keeper logo" className="brand-logo" />
        <div className="brand-text">
          <div className="name">AAUA keeper</div>
          <div className="sub">Facility Predictive Maintenance</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={currentSection === item.id ? "active" : ""}
            onClick={() => {
              onNavigate?.(item.id)
              onClose?.()
            }}
          >
            <span className="nav-icon"><item.icon size={16} /></span>
            {item.label}
          </button>
        ))}

        <button
          type="button"
          className="sidebar-logout"
          onClick={() => {
            onLogout?.()
            onClose?.()
          }}
        >
          <span className="nav-icon"><LogOut size={16} /></span>
          Logout
        </button>
      </div>

      <div className="foot">© 2026 Smart University</div>
    </div>
  )
}

export default Sidebar
