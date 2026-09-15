import { Home, HardDrive, Activity, BarChart3, Bell, Wrench, FileText, Settings, LogOut, X } from "lucide-react"
import logo from "../assets/images/logo.png"

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, roles: ["manager", "technician", "executive", "admin"] },
  { id: "equipment", label: "Equipment", icon: HardDrive, roles: ["manager", "technician", "admin"] },
  { id: "monitoring", label: "Live Monitoring", icon: Activity, roles: ["manager", "technician", "admin"] },
  { id: "predictions", label: "Predictions", icon: BarChart3, roles: ["manager", "admin"] },
  { id: "alerts", label: "Alerts", icon: Bell, roles: ["manager", "executive", "admin"] },
  { id: "maintenance", label: "Maintenance", icon: Wrench, roles: ["manager", "technician", "admin"] },
  { id: "reports", label: "Reports", icon: FileText, roles: ["manager", "executive", "admin"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["manager", "executive", "admin"] }
]

function Sidebar({ currentSection, currentUser, onNavigate, onLogout, isOpen, onClose }) {
  const visibleItems = navigationItems.filter((item) => item.roles.includes(currentUser?.role))

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
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={currentSection === item.id ? "active" : ""}
            onClick={() => {
              onNavigate?.(item.id)
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
