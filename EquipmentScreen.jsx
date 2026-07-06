import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function EquipmentScreen({ predictions, workOrders, onViewEquipment, selectedEquipment, addWorkOrder }) {
  const [selected, setSelected] = useState(selectedEquipment || null)

  function handleSelect(eq) {
    setSelected(eq)
  }

  function handleCreateWorkOrder(eq) {
    addWorkOrder({
      asset: eq.name,
      detail: eq.classification + " · " + eq.failureRisk + "% fault risk · est. " + eq.predictedDays + " days until failure"
    })
    alert("Work order created for " + eq.name)
  }

  const trendData = selected ? Array.from({ length: 14 }, (_, i) => ({
    day: "D" + (i + 1),
    temperature: Math.round((selected.temperature - 10 + (i / 14) * 15 + (Math.random() * 4 - 2)) * 10) / 10
  })) : []

  return (
    <div>
      <div className="page-header">
        <h1>Equipment</h1>
        <p>View and manage all monitored equipment.</p>
      </div>

      <div className="grid-7-5">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">All Equipment</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Health</th>
                <th>Failure Risk</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => handleSelect(p)}>
                  <td style={{ color: "#6B7280", fontSize: "12px" }}>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: "#6B7280" }}>{p.location}</td>
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
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: p.failureRisk > 60 ? "#DC2626" : p.failureRisk > 30 ? "#D97706" : "#16A34A"
                    }}>{p.failureRisk}%</span>
                  </td>
                  <td>
                    <span className={
                      p.status === "Healthy" ? "pill pill-healthy" :
                      p.status === "Critical" ? "pill pill-critical" : "pill pill-attention"
                    }>{p.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleSelect(p) }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{selected.name}</div>
                  <div className="card-sub">{selected.id} · {selected.location}</div>
                </div>
                <span className={
                  selected.status === "Healthy" ? "pill pill-healthy" :
                  selected.status === "Critical" ? "pill pill-critical" : "pill pill-attention"
                }>{selected.status}</span>
              </div>

              <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div className="kpi-card" style={{ padding: "12px" }}>
                  <div className="kpi-icon blue" style={{ width: 32, height: 32, fontSize: 14 }}>🌡</div>
                  <div>
                    <div className="kpi-label">Temperature</div>
                    <div className="kpi-value" style={{ fontSize: "18px" }}>{selected.temperature}°C</div>
                  </div>
                </div>
                <div className="kpi-card" style={{ padding: "12px" }}>
                  <div className="kpi-icon amber" style={{ width: 32, height: 32, fontSize: 14 }}>📳</div>
                  <div>
                    <div className="kpi-label">Vibration</div>
                    <div className="kpi-value" style={{ fontSize: "18px" }}>{selected.vibration}</div>
                  </div>
                </div>
                <div className="kpi-card" style={{ padding: "12px" }}>
                  <div className="kpi-icon green" style={{ width: 32, height: 32, fontSize: 14 }}>⚡</div>
                  <div>
                    <div className="kpi-label">Current</div>
                    <div className="kpi-value" style={{ fontSize: "18px" }}>{selected.current_draw}A</div>
                  </div>
                </div>
                <div className="kpi-card" style={{ padding: "12px" }}>
                  <div className="kpi-icon red" style={{ width: 32, height: 32, fontSize: 14 }}>⏱</div>
                  <div>
                    <div className="kpi-label">Est. Failure</div>
                    <div className="kpi-value" style={{ fontSize: "18px" }}>{selected.predictedDays}d</div>
                  </div>
                </div>
              </div>

              <div className="card-title" style={{ marginBottom: "10px", fontSize: "13px" }}>Temperature Trend</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={trendData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>

              <div style={{ marginTop: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Contributing Factors</div>
                {[
                  { label: "High Vibration", level: selected.vibration > 3 ? "High" : "Normal", color: selected.vibration > 3 ? "#DC2626" : "#16A34A" },
                  { label: "High Temperature", level: selected.temperature > 50 ? "High" : "Normal", color: selected.temperature > 50 ? "#D97706" : "#16A34A" },
                  { label: "Operating Hours", level: selected.age_years > 10 ? "High" : "Normal", color: selected.age_years > 10 ? "#DC2626" : "#16A34A" }
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", padding: "5px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span>{f.label}</span>
                    <span style={{ fontWeight: 600, color: f.color }}>{f.level}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
                onClick={() => handleCreateWorkOrder(selected)}>
                + Create Work Order
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "#6B7280", fontSize: "13px" }}>
            Click any equipment row to view details
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipmentScreen