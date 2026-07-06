import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function LiveMonitoringScreen({ predictions, equipmentList }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeRange, setTimeRange] = useState("1")
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:3000/api/sensors/trend-all?hours=" + timeRange)
      .then((r) => r.json())
      .then((data) => {
        setTrendData(data)
        setLoading(false)
      })
  }, [timeRange])

  const avgTemp = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.temperature, 0) / predictions.length).toFixed(1) : 0
  const avgCurrent = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.current_draw, 0) / predictions.length).toFixed(1) : 0
  const avgVibration = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.vibration, 0) / predictions.length).toFixed(1) : 0

  const colors = ["#2563EB", "#D97706", "#DC2626", "#16A34A", "#7C3AED"]
  const equipIds = ["AC-001", "GEN-001", "PUMP-001", "AC-002", "LIFT-001"]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Live Monitoring</h1>
          <p>View real-time sensor data and status of all monitored equipment.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select style={{ width: "auto", padding: "7px 12px" }} value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1">Last 1 Hour</option>
            <option value="6">Last 6 Hours</option>
            <option value="24">Last 24 Hours</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setTimeRange(timeRange)}>🔄 Refresh</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-icon blue">🌡</div>
          <div>
            <div className="kpi-label">Avg Temperature</div>
            <div className="kpi-value">{avgTemp}°C</div>
            <div className="kpi-sub blue">All Equipment</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">⚡</div>
          <div>
            <div className="kpi-label">Avg Current</div>
            <div className="kpi-value">{avgCurrent}A</div>
            <div className="kpi-sub green">All Equipment</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber">📳</div>
          <div>
            <div className="kpi-label">Avg Vibration</div>
            <div className="kpi-value">{avgVibration}</div>
            <div className="kpi-sub amber">mm/s · All Equipment</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue">🕐</div>
          <div>
            <div className="kpi-label">Last Updated</div>
            <div className="kpi-value" style={{ fontSize: "16px" }}>{currentTime.toLocaleTimeString()}</div>
            <div className="kpi-sub blue">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-title" style={{ marginBottom: "14px" }}>Real-time Equipment Data</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment Name</th>
              <th>Location</th>
              <th>Temperature (°C)</th>
              <th>Current (A)</th>
              <th>Vibration (mm/s)</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, i) => (
              <tr key={p.id}>
                <td style={{ color: "#6B7280", fontSize: "12px" }}>{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: "#6B7280" }}>{p.location}</td>
                <td>
                  <span style={{ fontWeight: 600, color: p.temperature > 50 ? "#DC2626" : p.temperature > 40 ? "#D97706" : "#16A34A" }}>
                    {p.temperature}
                  </span>
                </td>
                <td><span style={{ fontWeight: 600 }}>{p.current_draw}</span></td>
                <td>
                  <span style={{ fontWeight: 600, color: p.vibration > 3 ? "#DC2626" : "#16A34A" }}>{p.vibration}</span>
                </td>
                <td>
                  <span className={
                    p.status === "Healthy" ? "pill pill-healthy" :
                    p.status === "Critical" ? "pill pill-critical" : "pill pill-attention"
                  }>{p.status}</span>
                </td>
                <td style={{ color: "#6B7280", fontSize: "12px" }}>{currentTime.toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Loading trend data from database...</div>
      ) : (
        <div className="grid-3">
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: "13.5px" }}>Temperature (°C)</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                {equipIds.map((id, i) => (
                  <Line key={id} type="monotone" dataKey={id + "_temp"} stroke={colors[i]} strokeWidth={1.5} dot={false} name={id} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
              {equipIds.map((id, i) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i] }}></div>
                  {id}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: "13.5px" }}>Current (A)</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                {equipIds.map((id, i) => (
                  <Line key={id} type="monotone" dataKey={id + "_current"} stroke={colors[i]} strokeWidth={1.5} dot={false} name={id} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
              {equipIds.map((id, i) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i] }}></div>
                  {id}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: "13.5px" }}>Vibration (mm/s)</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                {equipIds.map((id, i) => (
                  <Line key={id} type="monotone" dataKey={id + "_vib"} stroke={colors[i]} strokeWidth={1.5} dot={false} name={id} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
              {equipIds.map((id, i) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i] }}></div>
                  {id}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveMonitoringScreen