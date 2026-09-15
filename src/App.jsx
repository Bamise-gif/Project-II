import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import LoginScreen from "./components/LoginScreen"
import DashboardScreen from "./components/DashboardScreen"
import EquipmentScreen from "./components/EquipmentScreen"
import LiveMonitoringScreen from "./components/LiveMonitoringScreen"
import PredictionsScreen from "./components/PredictionsScreen"
import AlertsScreen from "./components/AlertsScreen"
import MaintenanceScreen from "./components/MaintenanceScreen"
import ReportsScreen from "./components/ReportsScreen"
import SettingsScreen from "./components/SettingsScreen"

const equipmentMeta = [
  { id: "AC-001", name: "Library AC Unit", location: "Main Library", age_years: 5, days_since_maintenance: 15 },
  { id: "GEN-001", name: "Main Generator", location: "Power House", age_years: 14, days_since_maintenance: 45 },
  { id: "PUMP-001", name: "Water Pump - Block A", location: "Block A Basement", age_years: 9, days_since_maintenance: 30 },
  { id: "AC-002", name: "Science Lab AC", location: "Science Building", age_years: 11, days_since_maintenance: 60 },
  { id: "LIFT-001", name: "Main Elevator", location: "Admin Building", age_years: 7, days_since_maintenance: 20 }
]

function App() {
  const [currentUser, setCurrentUser] = useState({ username: "admin", role: "admin" })
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [workOrders, setWorkOrders] = useState([])
  const [reports, setReports] = useState([])
  const [predictions, setPredictions] = useState([])
  const [sensorReadings, setSensorReadings] = useState([])
  const [equipmentList, setEquipmentList] = useState(equipmentMeta)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("theme")
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light"
  })
  const isDarkMode = theme === "dark"

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    document.documentElement.setAttribute("data-theme", theme)
    window.localStorage.setItem("theme", theme)
  }, [theme, isDarkMode])

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
    return <LoginScreen onLogin={(user) => {
      setCurrentUser(user)
      setCurrentSection("dashboard")
    }} />
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
    onNavigate: setCurrentSection,
    onViewEquipment: function(eq) {
      setSelectedEquipment(eq)
      setCurrentSection("equipment")
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

  const allNavItems = [
    { key: "dashboard", icon: "🏠", label: "Dashboard", roles: ["manager", "technician", "executive", "admin"] },
    { key: "equipment", icon: "🖥", label: "Equipment", roles: ["manager", "technician", "admin"] },
    { key: "monitoring", icon: "📡", label: "Live Monitoring", roles: ["manager", "technician", "admin"] },
    { key: "predictions", icon: "📈", label: "Predictions", roles: ["manager", "admin"] },
    { key: "alerts", icon: "🔔", label: "Alerts", roles: ["manager", "executive", "admin"] },
    { key: "maintenance", icon: "🔧", label: "Maintenance", roles: ["manager", "technician", "admin"] },
    { key: "reports", icon: "📄", label: "Reports", roles: ["manager", "executive", "admin"] },
    { key: "settings", icon: "⚙️", label: "Settings", roles: ["manager", "executive", "admin"] }
  ]

  const navItems = allNavItems.filter((item) => item.roles.includes(currentUser.role))

  function navigate(key) {
    setCurrentSection(key)
  }

  return (
    <div className={"app-shell" + (isSidebarOpen ? " sidebar-open" : "")}>
      <Sidebar
        currentSection={currentSection}
        currentUser={currentUser}
        onNavigate={navigate}
        onLogout={() => setCurrentUser(null)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="main-area">
        <Header
          currentScreen={currentSection}
          currentUser={currentUser}
          onMenuOpen={() => setIsSidebarOpen((previous) => !previous)}
          theme={theme}
          onThemeToggle={() => setTheme((previous) => previous === "dark" ? "light" : "dark")}
        />
        <div className="content">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}

export default App