import { useState, useEffect } from "react"

function SettingsScreen({ currentUser }) {
  const [alertThreshold, setAlertThreshold] = useState(70)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [autoWorkOrder, setAutoWorkOrder] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [maxTemp, setMaxTemp] = useState("60")
  const [maxVibration, setMaxVibration] = useState("3.5")
  const [maxCurrent, setMaxCurrent] = useState("15")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("http://localhost:3000/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setAlertThreshold(data.alert_threshold)
        setRefreshInterval(String(data.refresh_interval))
        setEmailNotifs(data.email_notifs === 1)
        setPushNotifs(data.push_notifs === 1)
        setAutoWorkOrder(data.auto_work_order === 1)
        setMaxTemp(String(data.max_temperature))
        setMaxVibration(String(data.max_vibration))
        setMaxCurrent(String(data.max_current))
      })
  }, [])

  function handleSave() {
    fetch("http://localhost:3000/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alert_threshold: alertThreshold,
        refresh_interval: Number(refreshInterval),
        email_notifs: emailNotifs,
        push_notifs: pushNotifs,
        auto_work_order: autoWorkOrder,
        max_temperature: Number(maxTemp),
        max_vibration: Number(maxVibration),
        max_current: Number(maxCurrent)
      })
    }).then(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  function Toggle({ value, onChange }) {
    return (
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? "#2563EB" : "#D1D5DB",
          position: "relative", cursor: "pointer",
          transition: "background 0.2s"
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "white",
          position: "absolute", top: 3,
          left: value ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure system preferences and notification settings.</p>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: "16px" }}>Account Information</div>
            <div className="field">
              <label>Username</label>
              <input type="text" value={currentUser?.username || "admin"} readOnly style={{ background: "#F9FAFB" }} />
            </div>
            <div className="field">
              <label>Role</label>
              <input type="text" value={currentUser?.role || "Administrator"} readOnly style={{ background: "#F9FAFB" }} />
            </div>
            <div className="field">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Update Password</button>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: "16px" }}>System Information</div>
            {[
              { label: "System Version", value: "v2.4.1" },
              { label: "ML Model Version", value: "XGBoost 3.3 · ISO Forest · RF Regression" },
              { label: "Database", value: "SQLite · campuspulse.db" },
              { label: "Backend", value: "Node.js / Express · Port 3000" },
              { label: "ML Server", value: "Python / Flask · Port 5000" },
              { label: "Last Prediction Run", value: "Just now" }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6", fontSize: "13px" }}>
                <span style={{ color: "#6B7280" }}>{item.label}</span>
                <span style={{ fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: "16px" }}>Alert Settings</div>
            <div className="field">
              <label>Failure Risk Alert Threshold (%)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="range" min={10} max={95} step={5}
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 700, minWidth: "40px" }}>{alertThreshold}%</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                Assets above this threshold will trigger alerts
              </div>
            </div>

            <div className="field">
              <label>Data Refresh Interval</label>
              <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
                <option value="15">Every 15 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13.5px" }}>Email Notifications</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Receive alerts via email</div>
              </div>
              <Toggle value={emailNotifs} onChange={setEmailNotifs} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13.5px" }}>Push Notifications</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Browser push notifications</div>
              </div>
              <Toggle value={pushNotifs} onChange={setPushNotifs} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13.5px" }}>Auto-create Work Orders</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Automatically create work orders for critical alerts</div>
              </div>
              <Toggle value={autoWorkOrder} onChange={setAutoWorkOrder} />
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: "16px" }}>Equipment Thresholds</div>
            <div className="field">
              <label>Max Temperature (°C)</label>
              <input type="text" value={maxTemp} onChange={(e) => setMaxTemp(e.target.value)} />
            </div>
            <div className="field">
              <label>Max Vibration (mm/s)</label>
              <input type="text" value={maxVibration} onChange={(e) => setMaxVibration(e.target.value)} />
            </div>
            <div className="field">
              <label>Max Current Draw (A)</label>
              <input type="text" value={maxCurrent} onChange={(e) => setMaxCurrent(e.target.value)} />
            </div>
          </div>

          {saved && (
            <div style={{ background: "#F0FDF4", border: "1px solid #16A34A", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px", color: "#16A34A", fontWeight: 600, fontSize: "13.5px", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> Settings saved successfully
            </div>
          )}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsScreen