import { useState, useEffect } from "react"
import { Menu, X, Bell, Settings, Moon, Sun } from "lucide-react"
import LoginScreen from "./LoginScreen"
import DashboardScreen from "./DashboardScreen"
import EquipmentScreen from "./EquipmentScreen"
import LiveMonitoringScreen from "./LiveMonitoringScreen"
import PredictionsScreen from "./PredictionsScreen"
import AlertsScreen from "./AlertsScreen"
import MaintenanceScreen from "./MaintenanceScreen"
import ReportsScreen from "./ReportsScreen"
import SettingsScreen from "./SettingsScreen"
import Sidebar from "./Sidebar"
import Header  from "./Header"
import logo from "./images/logo.png"
//central controller for the entire application, managing state and routing between different sections of the app.

const equipmentMeta = [
  { id: "AC-001", name: "Library AC Unit", location: "Main Library", age_years: 5, days_since_maintenance: 15 },
  { id: "GEN-001", name: "Main Generator", location: "Power House", age_years: 14, days_since_maintenance: 45 },
  { id: "PUMP-001", name: "Water Pump - Block A", location: "Block A Basement", age_years: 9, days_since_maintenance: 30 },
  { id: "AC-002", name: "Science Lab AC", location: "Science Building", age_years: 11, days_since_maintenance: 60 },
  { id: "LIFT-001", name: "Main Elevator", location: "Admin Building", age_years: 7, days_since_maintenance: 20 }
]

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [workOrders, setWorkOrders] = useState([])
  const [reports, setReports] = useState([])
  const [predictions, setPredictions] = useState([])
  const [sensorReadings, setSensorReadings] = useState([])
  const [equipmentList, setEquipmentList] = useState(equipmentMeta)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light"
    const savedTheme = window.localStorage.getItem("theme")
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })
  const isDarkMode = theme === "dark"

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", isDarkMode)
    root.setAttribute("data-theme", theme)
    window.localStorage.setItem("theme", theme)
  }, [theme, isDarkMode])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    fetch("http://localhost:3000/api/workorders")
      .then((r) => r.json())
      .then(setWorkOrders)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    fetch("http://localhost:3000/api/reports")
      .then((r) => r.json())
      .then(setReports)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    function loadSensors() {
      fetch("http://localhost:3000/api/sensors/latest")
        .then((r) => r.json())
        .then((data) => {
          setSensorReadings(data)
          const merged = equipmentMeta.map((eq) => {
            const reading = data.find((r) => r.equipment_id === eq.id)
            return {
              ...eq,
              temperature: reading ? reading.temperature : 0,
              vibration: reading ? reading.vibration : 0,
              current_draw: reading ? reading.current_draw : 0,
              dbStatus: reading ? reading.status : "Unknown"
            }
          })
          setEquipmentList(merged)
        })
    }
    loadSensors()
    const interval = setInterval(loadSensors, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    if (sensorReadings.length === 0) return
    const list = equipmentMeta.map((eq) => {
      const reading = sensorReadings.find((r) => r.equipment_id === eq.id)
      return {
        ...eq,
        temperature: reading ? reading.temperature : 0,
        vibration: reading ? reading.vibration : 0,
        current_draw: reading ? reading.current_draw : 0
      }
    })
    if (list[0].temperature === 0) return
    Promise.all(
      list.map((e) =>
        fetch("http://localhost:3000/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e)
        }).then((r) => r.json())
      )
    ).then((results) => {
      const merged = list.map((e, i) => {
        const r = results[i]
        let status = "Healthy"
        if (r.classification === "Emergency Fault") status = "Critical"
        else if (r.classification === "Routine Anomaly") status = "Attention"
        else if (r.classification === "Long-term RUL Warning") status = "Attention"
        return {
          ...e,
          healthScore: Math.max(10, Math.round(100 - r.emergency_fault_probability)),
          failureRisk: r.emergency_fault_probability,
          predictedDays: r.predicted_days_until_failure,
          classification: r.classification,
          status
        }
      })
      setPredictions(merged)
    })
  }, [sensorReadings])

  function addWorkOrder(newOrder) {
    fetch("http://localhost:3000/api/workorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder)
    })
      .then((r) => r.json())
      .then((data) => {
        setWorkOrders([{ ...newOrder, id: data.id, status: "Pending" }, ...workOrders])
      })
  }

  function completeWorkOrder(id, outcome) {
    fetch("http://localhost:3000/api/workorders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Done", outcome: outcome })
    }).then(() => {
      setWorkOrders(workOrders.map((w) => w.id === id ? { ...w, status: "Done", outcome: outcome } : w))
    })
  }

  function addReport(newReport) {
    fetch("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReport)
    })
      .then((r) => r.json())
      .then((data) => {
        setReports([{ ...newReport, id: data.id, status: "Pending" }, ...reports])
      })
  }

  if (!currentUser) {
    setCurrentUser({ username: "admin", role: "admin" })
    return null
  }

  const handleNavigate = (section) => {
    setCurrentSection(section)
    setIsSidebarOpen(false)
  }

  const sharedProps = {
    predictions: predictions,
    workOrders: workOrders,
    reports: reports,
    equipmentList: equipmentList,
    sensorReadings: sensorReadings,
    addWorkOrder: addWorkOrder,
    completeWorkOrder: completeWorkOrder,
    addReport: addReport,
    onNavigate: handleNavigate,
    onViewEquipment: function(eq) {
      setSelectedEquipment(eq)
      handleNavigate("equipment")
    }
  }

  function renderSection() {
    if (currentSection === "dashboard") return <DashboardScreen {...sharedProps} />
    if (currentSection === "equipment") return <EquipmentScreen {...sharedProps} selectedEquipment={selectedEquipment} />
    if (currentSection === "monitoring") return <LiveMonitoringScreen {...sharedProps} />
    if (currentSection === "predictions") return <PredictionsScreen {...sharedProps} />
    if (currentSection === "alerts") return <AlertsScreen {...sharedProps} />
    if (currentSection === "maintenance") return <MaintenanceScreen {...sharedProps} />
    if (currentSection === "reports") return <ReportsScreen {...sharedProps} />
    if (currentSection === "settings") return <SettingsScreen {...sharedProps} currentUser={currentUser} />
    return <DashboardScreen {...sharedProps} />
  }

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        onLogout={() => {
          setCurrentUser(null)
          setIsSidebarOpen(false)
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-area">
        <div className="topbar">
          <div className="topbar-left">
            <img src={logo} alt="Logo" className="topbar-logo" />
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="page-title">
              {currentSection === "dashboard" && "Dashboard"}
              {currentSection === "equipment" && "Project"}
              {currentSection === "monitoring" && "Insights"}
              {currentSection === "predictions" && "Analysis"}
              {currentSection === "alerts" && "Document"}
              {currentSection === "maintenance" && "Time Tracker"}
              {currentSection === "reports" && "Reports"}
              {currentSection === "settings" && "Setting"}
            </div>
          </div>
          <div className="right">
            <button type="button" className="icon-btn notif-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="dot"></span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Settings"
              onClick={() => handleNavigate("settings")}
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              className="icon-btn theme-toggle"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setTheme((prev) => prev === "dark" ? "light" : "dark")}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="admin-badge">
              <div className="admin-avatar">A</div>
              {currentUser.username} ▾
            </div>
          </div>
        </div>
        <div className="content">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}


export default App