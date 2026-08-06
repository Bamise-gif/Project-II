import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Box, CheckCircle2, Zap, AlertTriangle, Clipboard, Download, Hourglass } from "lucide-react"

function ReportsScreen({ predictions, workOrders, reports }) {
  const total = predictions.length
  const healthy = predictions.filter((p) => p.status === "Healthy").length
  const attention = predictions.filter((p) => p.status === "Attention").length
  const highRisk = predictions.filter((p) => p.status === "Critical").length
  const completed = workOrders.filter((w) => w.status === "Done").length
  const inProgress = workOrders.filter((w) => w.status !== "Done").length

  const pieData = [
    { name: "Healthy", value: healthy || 0, color: "#16A34A" },
    { name: "Need Attention", value: attention || 0, color: "#D97706" },
    { name: "High Risk", value: highRisk || 0, color: "#DC2626" }
  ].filter((d) => d.value > 0)

  const healthTrendData = ["May 1", "May 6", "May 11", "May 16", "May 21", "May 26", "May 31"].map((date, i) => {
    const point = { date }
    predictions.forEach((p) => {
      point[p.id] = Math.max(20, Math.min(100, p.healthScore + Math.sin(i + p.healthScore) * 10))
    })
    return point
  })

  const colors = ["#2563EB", "#D97706", "#DC2626", "#16A34A", "#7C3AED"]

  const recentReports = [
    { name: "Maintenance Report – May 2025", type: "Maintenance", generated: "May 23, 2025  10:30 AM", endpoint: "maintenance" },
    { name: "Equipment Performance Report – May 2025", type: "Performance", generated: "May 23, 2025  10:30 AM", endpoint: "performance" },
    { name: "Alerts Summary – May 2025", type: "Alerts", generated: "May 23, 2025  10:30 AM", endpoint: "alerts" }
  ]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Reports</h1>
          <p>View and download maintenance and equipment performance reports.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select style={{ width: "auto", padding: "7px 12px" }}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
          </select>
          <button className="btn btn-secondary"><Download size={14} style={{ marginRight: 6 }} /> Export</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Box size={18} /></div>
          <div>
            <div className="kpi-label">Total Equipment Monitored</div>
            <div className="kpi-value">{total}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
          <div>
            <div className="kpi-label">Healthy</div>
            <div className="kpi-value">{healthy}</div>
            <div className="kpi-sub green">({total > 0 ? Math.round(healthy / total * 100) : 0}%)</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><Zap size={18} /></div>
          <div>
            <div className="kpi-label">Need Attention</div>
            <div className="kpi-value">{attention}</div>
            <div className="kpi-sub amber">({total > 0 ? Math.round(attention / total * 100) : 0}%)</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={18} /></div>
          <div>
            <div className="kpi-label">High Risk</div>
            <div className="kpi-value">{highRisk}</div>
            <div className="kpi-sub red">({total > 0 ? Math.round(highRisk / total * 100) : 0}%)</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "16px" }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>Equipment Health Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>{total} Total</div>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", marginBottom: "4px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }}></div>
                  <span>{d.name}</span>
                  <span style={{ fontWeight: 600 }}>{d.value} ({total > 0 ? Math.round(d.value / total * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>Maintenance Summary</div>
          <div style={{ fontSize: "13px" }}>
            {[
              { label: "Total Maintenance Tasks", value: workOrders.length, icon: <Clipboard size={14} /> },
              { label: "Completed", value: completed, icon: <CheckCircle2 size={14} />, pct: workOrders.length > 0 ? Math.round(completed / workOrders.length * 100) : 0 },
              { label: "In Progress / Pending", value: inProgress, icon: <Hourglass size={14} />, pct: workOrders.length > 0 ? Math.round(inProgress / workOrders.length * 100) : 0 }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {item.value}
                  {item.pct !== undefined && <span style={{ fontWeight: 400, color: "#6B7280", fontSize: "12px" }}> ({item.pct}%)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-title" style={{ marginBottom: "14px" }}>Equipment Health Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={healthTrendData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            {predictions.map((p, i) => (
              <Line key={p.id} type="monotone" dataKey={p.id} stroke={colors[i]} strokeWidth={2} dot={{ r: 3 }} name={p.name} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
          {predictions.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[i] }}></div>
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: "14px" }}>Recent Reports</div>
        <table>
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Generated On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td><span className="pill pill-info" style={{ fontSize: "11px" }}>{r.type}</span></td>
                <td style={{ color: "#6B7280", fontSize: "12.5px" }}>{r.generated}</td>
                <td>
                  <a
                    href={"http://localhost:3000/api/reports/download/" + r.endpoint}
                    download
                    style={{ color: "#2563EB", fontWeight: 600, fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Download size={14} /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsScreen