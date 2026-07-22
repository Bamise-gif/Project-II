import { useState } from "react"
import { AlertTriangle, Zap, Info, CheckCircle2 } from "lucide-react"

function AlertsScreen({ predictions, workOrders }) {
  const [activeFilter, setActiveFilter] = useState("All")

  const alerts = [
    ...predictions
      .filter((p) => p.status === "Critical")
      .map((p) => ({
        id: "alert-" + p.id,
        title: "Failure predicted",
        sub: p.name + " (" + p.id + ")",
        type: "High Risk",
        icon: <AlertTriangle size={16} />,
        iconColor: "red",
        time: "2 min ago",
        detail: p.failureRisk + "% failure risk · est. " + p.predictedDays + " days until failure"
      })),
    ...predictions
      .filter((p) => p.status === "Attention")
      .map((p) => ({
        id: "alert-att-" + p.id,
        title: "Performance dropping",
        sub: p.name + " (" + p.id + ")",
        type: "Attention",
        icon: <Zap size={16} />,
        iconColor: "amber",
        time: "15 min ago",
        detail: "Routine anomaly detected · monitoring advised"
      })),
    {
      id: "alert-info-1",
      title: "Sensor reconnected",
      sub: "Main Elevator (LIFT-001)",
      type: "Info",
      icon: <Info size={16} />,
      iconColor: "blue",
      time: "1 hour ago",
      detail: "Sensor back online after brief connectivity loss"
    }
  ]

  const filtered = activeFilter === "All" ? alerts :
    alerts.filter((a) => a.type === activeFilter)

  const highRisk = alerts.filter((a) => a.type === "High Risk").length
  const attention = alerts.filter((a) => a.type === "Attention").length
  const info = alerts.filter((a) => a.type === "Info").length

  return (
    <div>
      <div className="page-header">
        <h1>Alerts</h1>
        <p>View and manage all system alerts and notifications.</p>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={18} /></div>
          <div>
            <div className="kpi-label">High Risk</div>
            <div className="kpi-value" style={{ color: "#DC2626" }}>{highRisk}</div>
            <div className="kpi-sub red">Immediate action</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><Zap size={18} /></div>
          <div>
            <div className="kpi-label">Attention</div>
            <div className="kpi-value" style={{ color: "#D97706" }}>{attention}</div>
            <div className="kpi-sub amber">Needs attention</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Info size={18} /></div>
          <div>
            <div className="kpi-label">Information</div>
            <div className="kpi-value" style={{ color: "#2563EB" }}>{info}</div>
            <div className="kpi-sub blue">System updates</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
          <div>
            <div className="kpi-label">Total Alerts</div>
            <div className="kpi-value">{alerts.length}</div>
            <div className="kpi-sub green">All notifications</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Alerts</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["All", "High Risk", "Attention", "Info"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: "1px solid",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderColor: activeFilter === f ? "#2563EB" : "#E5E7EB",
                  background: activeFilter === f ? "#EFF6FF" : "white",
                  color: activeFilter === f ? "#2563EB" : "#6B7280"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ color: "#6B7280", fontSize: "13px", padding: "20px 0" }}>No alerts in this category.</p>
        )}

        {filtered.map((a) => (
          <div key={a.id} className="alert-item">
            <div className={"alert-icon " + a.iconColor}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="alert-title">{a.title}</div>
                <span className={
                  a.type === "High Risk" ? "pill pill-critical" :
                  a.type === "Attention" ? "pill pill-attention" : "pill pill-info"
                } style={{ fontSize: "10px", padding: "2px 8px" }}>{a.type}</span>
              </div>
              <div className="alert-sub">{a.sub}</div>
              <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "2px" }}>{a.detail}</div>
            </div>
            <div className="alert-time">{a.time}</div>
          </div>
        ))}

        {alerts.length > 0 && (
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <button className="btn btn-secondary">View All Alerts</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsScreen