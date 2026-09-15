const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const db = require("./db")

const app = express()
app.use(cors())
app.use(express.json())

// GET all reports
app.get("/api/reports", (req, res) => {
  const reports = db.prepare("SELECT * FROM reports ORDER BY id DESC").all()
  res.json(reports)
})

// POST a new report
app.post("/api/reports", (req, res) => {
  const { location, category, description, urgency } = req.body
  const result = db.prepare(
    "INSERT INTO reports (location, category, description, urgency, status) VALUES (?, ?, ?, ?, ?)"
  ).run(location, category, description, urgency, "Pending")
  res.json({ id: result.lastInsertRowid })
})

app.get("/api/buildings", (req, res) => {
  const buildings = db.prepare("SELECT * FROM buildings").all()
  res.json(buildings)
})

app.get("/api/equipment", (req, res) => {
  const equipment = db.prepare("SELECT * FROM equipment ORDER BY equipment_id").all()
  res.json(equipment)
})

// GET all work orders
app.get("/api/workorders", (req, res) => {
  const orders = db.prepare("SELECT * FROM work_orders ORDER BY id DESC").all()
  res.json(orders)
})

// POST a new work order
app.post("/api/workorders", (req, res) => {
  const { asset, detail, priority, due_date } = req.body
  const result = db.prepare(
    "INSERT INTO work_orders (asset, detail, status, priority, due_date) VALUES (?, ?, ?, ?, ?)"
  ).run(asset, detail, "Pending", priority || "Medium", due_date || null)
  res.json({ id: result.lastInsertRowid })
})

app.post("/api/predict", async (req, res) => {
  const response = await fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  })
  const data = await response.json()
  res.json(data)
})

// GET settings
app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get()
  res.json(settings)
})

// PATCH settings
app.patch("/api/settings", (req, res) => {
  const { alert_threshold, refresh_interval, email_notifs, push_notifs, auto_work_order, max_temperature, max_vibration, max_current } = req.body
  db.prepare(`
    UPDATE settings SET
      alert_threshold = ?,
      refresh_interval = ?,
      email_notifs = ?,
      push_notifs = ?,
      auto_work_order = ?,
      max_temperature = ?,
      max_vibration = ?,
      max_current = ?
    WHERE id = 1
  `).run(alert_threshold, refresh_interval, email_notifs ? 1 : 0, push_notifs ? 1 : 0, auto_work_order ? 1 : 0, max_temperature, max_vibration, max_current)
  res.json({ success: true })
})

// PATCH (update) a work order's status
app.patch("/api/workorders/:id", (req, res) => {
  const { status, outcome } = req.body
  db.prepare("UPDATE work_orders SET status = ?, outcome = ? WHERE id = ?").run(status, outcome, req.params.id)
  res.json({ success: true })
})

// POST login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" })
  }
  const passwordMatches = bcrypt.compareSync(password, user.password_hash)
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid username or password" })
  }
  res.json({ username: user.username, role: user.role })
})
// GET report download (generates a simple CSV)
app.get("/api/reports/download/:type", (req, res) => {
  const type = req.params.type
  let csv = ""
  let filename = ""
  if (type === "maintenance") {
    filename = "maintenance_report.csv"
    csv = "ID,Asset,Detail,Status,Priority,Due Date,Outcome\n"
    const orders = db.prepare("SELECT * FROM work_orders ORDER BY id DESC").all()
    orders.forEach((o) => {
      csv += [o.id, o.asset, o.detail, o.status, o.priority || "Medium", o.due_date || "TBD", o.outcome || ""].join(",") + "\n"
    })
  } else if (type === "performance") {
    filename = "performance_report.csv"
    csv = "ID,Location,Category,Description,Urgency,Status,Created At\n"
    const reports = db.prepare("SELECT * FROM reports ORDER BY id DESC").all()
    reports.forEach((r) => {
      csv += [r.id, r.location, r.category, r.description, r.urgency, r.status, r.created_at].join(",") + "\n"
    })
  } else {
    filename = "alerts_report.csv"
    csv = "ID,Asset,Detail,Status,Created At\n"
    const orders = db.prepare("SELECT * FROM work_orders ORDER BY id DESC").all()
    orders.forEach((o) => {
      csv += [o.id, o.asset, o.detail, o.status, o.created_at].join(",") + "\n"
    })
  }
  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", "attachment; filename=" + filename)
  res.send(csv)
})

// GET latest reading per equipment (uses latest timestamp in DB as reference)
app.get("/api/sensors/latest", (req, res) => {
  const equipment = ["AC-001", "GEN-001", "PUMP-001", "AC-002", "LIFT-001"]
  const results = equipment.map((id) => {
    const row = db.prepare(
      "SELECT * FROM sensor_readings WHERE equipment_id = ? ORDER BY timestamp DESC LIMIT 1"
    ).get(id)
    return row
  }).filter(Boolean)
  res.json(results)
})

// GET aggregated trend data for charts (hourly averages, uses latest DB timestamp)
app.get("/api/sensors/trend/:equipment_id", (req, res) => {
  const { equipment_id } = req.params
  const hours = parseInt(req.query.hours) || 24

  const latestRow = db.prepare("SELECT MAX(timestamp) as latest FROM sensor_readings WHERE equipment_id = ?").get(equipment_id)
  if (!latestRow || !latestRow.latest) return res.json([])
  const latest = latestRow.latest

  const rows = db.prepare(`
    SELECT
      strftime('%Y-%m-%dT%H:00:00', timestamp) as hour,
      ROUND(AVG(temperature), 1) as temperature,
      ROUND(AVG(vibration), 3) as vibration,
      ROUND(AVG(current_draw), 2) as current_draw,
      COUNT(*) as reading_count
    FROM sensor_readings
    WHERE equipment_id = ?
      AND timestamp >= datetime(?, '-' || ? || ' hours')
      AND timestamp <= ?
    GROUP BY strftime('%Y-%m-%dT%H:00:00', timestamp)
    ORDER BY hour ASC
  `).all(equipment_id, latest, hours, latest)

  res.json(rows)
})

// GET aggregated trend for ALL equipment (uses latest DB timestamp as reference)
app.get("/api/sensors/trend-all", (req, res) => {
  const hours = parseInt(req.query.hours) || 1
  const equipment = ["AC-001", "GEN-001", "PUMP-001", "AC-002", "LIFT-001"]

  const latestRow = db.prepare("SELECT MAX(timestamp) as latest FROM sensor_readings").get()
  if (!latestRow || !latestRow.latest) return res.json([])
  const latest = latestRow.latest

  const timePoints = db.prepare(`
    SELECT DISTINCT strftime('%Y-%m-%dT%H:%M:00', timestamp) as minute
    FROM sensor_readings
    WHERE timestamp >= datetime(?, '-' || ? || ' hours')
      AND timestamp <= ?
    ORDER BY minute ASC
    LIMIT 60
  `).all(latest, hours, latest).map((r) => r.minute)

  const result = timePoints.map((tp) => {
    const point = { time: tp.substring(11, 16) }
    equipment.forEach((id) => {
      const row = db.prepare(`
        SELECT
          ROUND(AVG(temperature), 1) as temperature,
          ROUND(AVG(vibration), 3) as vibration,
          ROUND(AVG(current_draw), 2) as current_draw
        FROM sensor_readings
        WHERE equipment_id = ?
          AND timestamp >= datetime(?, '-30 minutes')
          AND timestamp <= datetime(?, '+30 minutes')
      `).get(id, tp, tp)
      if (row) {
        point[id + "_temp"] = row.temperature
        point[id + "_vib"] = row.vibration
        point[id + "_current"] = row.current_draw
      }
    })
    return point
  })

  res.json(result)
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})