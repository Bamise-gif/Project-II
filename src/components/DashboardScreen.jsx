// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// function DashboardScreen({ predictions, workOrders, reports, onNavigate }) {
//   const healthy = predictions.filter((p) => p.status === "Healthy").length
//   const attention = predictions.filter((p) => p.status === "Attention").length
//   const critical = predictions.filter((p) => p.status === "Critical").length
//   const total = predictions.length
//   const activeIssues = attention + critical
//   const accuracy = total > 0 ? Math.round((healthy / total) * 100) : 0

//   const recentAlerts = predictions
//     .filter((p) => p.status !== "Healthy")
//     .slice(0, 4)
//     .map((p) => ({
//       title: p.status === "Critical" ? "Failure predicted" : "Performance dropping",
//       sub: p.name + " (" + p.id + ")",
//       type: p.status === "Critical" ? "red" : "amber",
//       icon: p.status === "Critical" ? "⚠️" : "⚡",
//       time: Math.floor(Math.random() * 30) + " min ago"
//     }))

//   return (
//     <div>
//       <div className="page-header">
//         <h1>Welcome, Admin 👋</h1>
//         <p>Here's an overview of your facilities.</p>
//       </div>

//       <div className="kpi-grid kpi-grid-alt">
//         <div className="kpi-card-alt soft-gold">
//           <div className="kpi-card-header">
//             <div className="kpi-card-title">Total Equipment</div>

//             <div className="kpi-card-subtitle">All monitored equipment</div>
//           </div>
//           <div className="kpi-card-bottom">
//             <div className="kpi-card-value">{total}</div>
//             <div className="kpi-card-arrow">→</div>
//           </div>
//         </div>
//         <div className="kpi-card-alt soft-blue">
//           <div className="kpi-card-header">
//             <div className="kpi-card-title">Active Issues</div>
//             <div className="kpi-card-subtitle">Equipment requiring attention</div>
//           </div>
//           <div className="kpi-card-bottom">
//             <div className="kpi-card-value">{activeIssues}</div>
//             <div className="kpi-card-arrow">→</div>
//           </div>
//         </div>
//         <div className="kpi-card-alt soft-lavender">
//           <div className="kpi-card-header">
//             <div className="kpi-card-title">AI Accuracy</div>
//             <div className="kpi-card-subtitle">Healthy prediction rate</div>
//           </div>
//           <div className="kpi-card-bottom">
//             <div className="kpi-card-value">{accuracy}%</div>
//             <div className="kpi-card-arrow">→</div>
//           </div>
//         </div>
//       </div>

//       <div className="grid-7-5">
//         <div className="card">
//           <div className="card-header">
//             <div><div className="card-title">Equipment Status</div></div>
//             <span className="view-all" onClick={() => onNavigate("equipment")}>View all</span>
//           </div>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Equipment Name</th>
//                 <th>Location</th>
//                 <th>Status</th>
//                 <th>Health Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {predictions.map((p) => (
//                 <tr key={p.id}>
//                   <td style={{ color: "#6B7280", fontSize: "12px" }}>{p.id}</td>
//                   <td style={{ fontWeight: 500 }}>{p.name}</td>
//                   <td style={{ color: "#6B7280" }}>{p.location}</td>
//                   <td>
//                     <span className={
//                       p.status === "Healthy" ? "pill pill-healthy" :
//                       p.status === "Critical" ? "pill pill-critical" : "pill pill-attention"
//                     }>{p.status}</span>
//                   </td>
//                   <td>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                       <span style={{ fontWeight: 600 }}>{p.healthScore}%</span>
//                       <div className="health-bar">
//                         <div className="health-bar-fill" style={{
//                           width: p.healthScore + "%",
//                           background: p.status === "Healthy" ? "#16A34A" : p.status === "Critical" ? "#DC2626" : "#D97706"
//                         }}></div>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="card">
//           <div className="card-header">
//             <div><div className="card-title">Recent Alerts</div></div>
//             <span className="view-all" onClick={() => onNavigate("alerts")}>View all</span>
//           </div>
//           {recentAlerts.length === 0 && <p style={{ color: "#6B7280", fontSize: "13px" }}>No active alerts.</p>}
//           {recentAlerts.map((a, i) => (
//             <div key={i} className="alert-item">
//               <div className={"alert-icon " + a.type}>{a.icon}</div>
//               <div style={{ flex: 1 }}>
//                 <div className="alert-title">{a.title}</div>
//                 <div className="alert-sub">{a.sub}</div>
//               </div>
//               <div className="alert-time">{a.time}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="quick-nav-grid">
//         <div className="quick-nav-card" onClick={() => onNavigate("monitoring")}>
//           <div className="quick-nav-icon">📡</div>
//           <div>
//             <div className="quick-nav-title">Live Monitoring</div>
//             <div className="quick-nav-sub">View real-time sensor data</div>
//           </div>
//           <span className="quick-nav-arrow">›</span>
//         </div>
//         <div className="quick-nav-card" onClick={() => onNavigate("predictions")}>
//           <div className="quick-nav-icon">📈</div>
//           <div>
//             <div className="quick-nav-title">Predictions</div>
//             <div className="quick-nav-sub">See prediction results</div>
//           </div>
//           <span className="quick-nav-arrow">›</span>
//         </div>
//         <div className="quick-nav-card" onClick={() => onNavigate("maintenance")}>
//           <div className="quick-nav-icon">🔧</div>
//           <div>
//             <div className="quick-nav-title">Maintenance</div>
//             <div className="quick-nav-sub">Manage maintenance tasks</div>
//           </div>
//           <span className="quick-nav-arrow">›</span>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default DashboardScreen
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle, Zap, CheckCircle2, Wifi, TrendingUp, Wrench, ChevronRight, Menu, Search, Mic, Bell, PlusCircle, PlayCircle } from "lucide-react"

function DashboardScreen({ predictions, workOrders, reports, onNavigate }) {
  const healthy = predictions.filter((p) => p.status === "Healthy").length
  const attention = predictions.filter((p) => p.status === "Attention").length
  const critical = predictions.filter((p) => p.status === "Critical").length
  const total = predictions.length

  const recentAlerts = predictions
    .filter((p) => p.status !== "Healthy")
    .slice(0, 4)
    .map((p) => ({
      title: p.status === "Critical" ? "Failure predicted" : "Performance dropping",
      sub: p.name + " (" + p.id + ")",
      type: p.status === "Critical" ? "red" : "amber",
      icon: p.status === "Critical" ? <AlertTriangle size={16} /> : <Zap size={16} />,
      time: Math.floor(Math.random() * 30) + " min ago"
    }))

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, Admin</h1>
        <p>Here's an overview of your facilities.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><CheckCircle2 size={18} /></div>
          <div>
            <div className="kpi-label">Total Equipment</div>
            <div className="kpi-value">{total}</div>
            <div className="kpi-sub blue">All monitored equipment</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
          <div>
            <div className="kpi-label">Healthy</div>
            <div className="kpi-value">{healthy}</div>
            <div className="kpi-sub green">{total > 0 ? Math.round(healthy / total * 100) : 0}% of total</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><Zap size={18} /></div>
          <div>
            <div className="kpi-label">Needs Attention</div>
            <div className="kpi-value">{attention}</div>
            <div className="kpi-sub amber">{total > 0 ? Math.round(attention / total * 100) : 0}% of total</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={18} /></div>
          <div>
            <div className="kpi-label">Critical</div>
            <div className="kpi-value">{critical}</div>
            <div className="kpi-sub red">{total > 0 ? Math.round(critical / total * 100) : 0}% of total</div>
          </div>
        </div>
      </div>
      <br></br>
      <br />

      <div className="grid-7-5">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Equipment Status</div></div>
            <span className="view-all" onClick={() => onNavigate("equipment")}>View all</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Health Score</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "#6B7280", fontSize: "12px" }}>{p.id}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: "#6B7280" }}>{p.location}</td>
                  <td>
                    <span className={
                      p.status === "Healthy" ? "pill pill-healthy" :
                      p.status === "Critical" ? "pill pill-critical" : "pill pill-attention"
                    }>{p.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600 }}>{p.healthScore}%</span>
                      <div className="health-bar">
                        <div className="health-bar-fill" style={{
                          width: p.healthScore + "%",
                          background: p.status === "Healthy" ? "#16A34A" : p.status === "Critical" ? "#DC2626" : "#D97706"
                        }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Recent Alerts</div></div>
            <span className="view-all" onClick={() => onNavigate("alerts")}>View all</span>
          </div>
          {recentAlerts.length === 0 && <p style={{ color: "#6B7280", fontSize: "13px" }}>No active alerts.</p>}
          {recentAlerts.map((a, i) => (
            <div key={i} className="alert-item">
              <div className={"alert-icon " + a.type}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="alert-title">{a.title}</div>
                <div className="alert-sub">{a.sub}</div>
              </div>
              <div className="alert-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-nav-grid">
        <div className="quick-nav-card" onClick={() => onNavigate("monitoring")}> 
          <div className="quick-nav-icon"><Wifi size={20} /></div>
          <div>
            <div className="quick-nav-title">Live Monitoring</div>
            <div className="quick-nav-sub">View real-time sensor data</div>
          </div>
          <span className="quick-nav-arrow"><ChevronRight size={18} /></span>
        </div>
        <div className="quick-nav-card" onClick={() => onNavigate("predictions")}>
          <div className="quick-nav-icon"><TrendingUp size={20} /></div>
          <div>
            <div className="quick-nav-title">Predictions</div>
            <div className="quick-nav-sub">See prediction results</div>
          </div>
          <span className="quick-nav-arrow"><ChevronRight size={18} /></span>
        </div>
        <div className="quick-nav-card" onClick={() => onNavigate("maintenance")}>
          <div className="quick-nav-icon"><Wrench size={20} /></div>
          <div>
            <div className="quick-nav-title">Maintenance</div>
            <div className="quick-nav-sub">Manage maintenance tasks</div>
          </div>
          <span className="quick-nav-arrow"><ChevronRight size={18} /></span>
        </div>
      </div>
    </div>
  )
}

export default DashboardScreen