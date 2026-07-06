import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

function PredictionsScreen({ predictions, addWorkOrder }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState("All Equipment")

  const filtered = filter === "All Equipment" ? predictions :
    predictions.filter((p) => p.status === filter)

  const total = predictions.length
  const healthy = predictions.filter((p) => p.status === "Healthy").length
  const attention = predictions.filter((p) => p.status === "Attention").length
  const highRisk = predictions.filter((p) => p.status === "Critical").length

  const pieData = [
    { name: "Healthy", value: healthy, color: "#16A34A" },
    { name: "Attention", value: attention, color: "#D97706" },
    { name: "High Risk", value: highRisk, color: "#DC2626" }
  ].filter((d) => d.value > 0)

  const selectedPrediction = selected ? predictions.find((p) => p.id === selected) : null

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Predictions</h1>
          <p>See AI predictions for equipment health and failure risk.</p>
        </div>
        <select
          style={{ width: "auto", padding: "7px 12px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All Equipment</option>
          <option>Healthy</option>
          <option>Attention</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-title" style={{ marginBottom: "16px" }}>Prediction Summary</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ textAlign: "center", padding: "14px 20px", background: "#F3F4F6", borderRadius: "10px", minWidth: "100px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>{total}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Total Equipment</div>
          </div>
          <div style={{ textAlign: "center", padding: "14px 20px", background: "#F0FDF4", borderRadius: "10px", minWidth: "100px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#16A34A" }}>✅ {healthy}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Healthy</div>
          </div>
          <div style={{ textAlign: "center", padding: "14px 20px", background: "#FFFBEB", borderRadius: "10px", minWidth: "100px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#D97706" }}>⚠️ {attention}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Need Attention</div>
          </div>
          <div style={{ textAlign: "center", padding: "14px 20px", background: "#FEF2F2", borderRadius: "10px", minWidth: "100px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#DC2626" }}>🚨 {highRisk}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>High Risk</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-title" style={{ marginBottom: "14px" }}>Equipment Predictions</div>
        <table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Health Score</th>
              <th>Failure Risk</th>
              <th>Prediction</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelected(p.id)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: "11.5px", color: "#6B7280" }}>{p.id}</div>
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
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(p.id) }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPrediction && (
        <div className="card" style={{ borderLeft: "4px solid " + (selectedPrediction.status === "Critical" ? "#DC2626" : selectedPrediction.status === "Attention" ? "#D97706" : "#16A34A") }}>
          <div className="card-header">
            <div>
              <div className="card-title">Prediction Details ({selectedPrediction.name})</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
          </div>

          <div className="grid-2">
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ position: "relative", width: 120, height: 120 }}>
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: selectedPrediction.failureRisk },
                        { value: 100 - selectedPrediction.failureRisk }
                      ]}
                      cx={55} cy={55}
                      innerRadius={38} outerRadius={55}
                      startAngle={90} endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill={selectedPrediction.status === "Critical" ? "#DC2626" : selectedPrediction.status === "Attention" ? "#D97706" : "#16A34A"} />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>{selectedPrediction.failureRisk}%</div>
                  <div style={{ fontSize: "9px", color: "#6B7280" }}>Failure Risk</div>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{selectedPrediction.status}</div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>Est. failure in {selectedPrediction.predictedDays} days</div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "10px" }}>Contributing Factors</div>
              {[
                { label: "High Vibration", level: selectedPrediction.vibration > 3 ? "High" : "Normal", color: selectedPrediction.vibration > 3 ? "#DC2626" : "#16A34A" },
                { label: "High Temperature", level: selectedPrediction.temperature > 50 ? "High" : "Medium", color: selectedPrediction.temperature > 50 ? "#D97706" : "#16A34A" },
                { label: "Current Fluctuation", level: selectedPrediction.current_draw > 10 ? "High" : "Normal", color: selectedPrediction.current_draw > 10 ? "#DC2626" : "#16A34A" },
                { label: "Operating Hours", level: selectedPrediction.age_years > 10 ? "High" : "Normal", color: selectedPrediction.age_years > 10 ? "#DC2626" : "#16A34A" }
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span>{f.label}</span>
                  <span style={{ fontWeight: 600, color: f.color }}>{f.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "14px", padding: "14px", background: "#FEF2F2", borderRadius: "8px" }}>
            <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}>Recommended Action</div>
            <p style={{ fontSize: "12.5px", color: "#374151" }}>
              {selectedPrediction.status === "Critical"
                ? "Inspect " + selectedPrediction.name + " immediately and schedule emergency maintenance."
                : "Schedule routine inspection for " + selectedPrediction.name + " within the next " + selectedPrediction.predictedDays + " days."}
            </p>
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Estimated Failure In</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#DC2626" }}>{selectedPrediction.predictedDays} days</div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: "10px" }}
              onClick={() => addWorkOrder({ asset: selectedPrediction.name, detail: selectedPrediction.classification + " · " + selectedPrediction.failureRisk + "% fault risk" })}>
              + Create Work Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionsScreen