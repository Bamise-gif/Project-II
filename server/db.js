const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")

const db = new Database("campuspulse.db")

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT,
    category TEXT,
    description TEXT,
    urgency TEXT,
    status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset TEXT,
    detail TEXT,
    status TEXT DEFAULT 'Pending',
    outcome TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

try {
  db.exec("ALTER TABLE work_orders ADD COLUMN outcome TEXT")
} catch (e) {
  // column already exists, ignore
}

try {
  db.exec("ALTER TABLE work_orders ADD COLUMN priority TEXT DEFAULT 'Medium'")
} catch (e) {
  // column already exists, ignore
}

try {
  db.exec("ALTER TABLE work_orders ADD COLUMN due_date TEXT")
} catch (e) {
  // column already exists, ignore
}

db.exec(`
  CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    health INTEGER,
    status TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT UNIQUE,
    name TEXT,
    location TEXT,
    status TEXT,
    health_score INTEGER,
    category TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    alert_threshold INTEGER DEFAULT 70,
    refresh_interval INTEGER DEFAULT 30,
    email_notifs INTEGER DEFAULT 1,
    push_notifs INTEGER DEFAULT 1,
    auto_work_order INTEGER DEFAULT 0,
    max_temperature REAL DEFAULT 60,
    max_vibration REAL DEFAULT 3.5,
    max_current REAL DEFAULT 15
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT,
    timestamp TEXT,
    temperature REAL,
    vibration REAL,
    current_draw REAL,
    status TEXT
  )
`)

try {
  db.exec("CREATE INDEX IF NOT EXISTS idx_sensor_equipment_time ON sensor_readings (equipment_id, timestamp)")
} catch (e) {}

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get()
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (id) VALUES (1)").run()
}

const existing = db.prepare("SELECT COUNT(*) as count FROM buildings").get()
if (existing.count === 0) {
  const insert = db.prepare("INSERT INTO buildings (name, health, status) VALUES (?, ?, ?)")
  insert.run("Hartwell Engineering Hall", 62, "Critical")
  insert.run("Linden Residence Tower B", 78, "Watch")
  insert.run("Meridian Library", 94, "Healthy")
}

const equipmentCount = db.prepare("SELECT COUNT(*) as count FROM equipment").get()
if (equipmentCount.count === 0) {
  const insertEquipment = db.prepare(
    "INSERT INTO equipment (equipment_id, name, location, status, health_score, category) VALUES (?, ?, ?, ?, ?, ?)"
  )

  const categories = [
    { type: "AC", name: "AC Unit" },
    { type: "GEN", name: "Generator" },
    { type: "PUMP", name: "Water Pump" },
    { type: "LIFT", name: "Elevator" },
    { type: "HVAC", name: "HVAC Unit" },
    { type: "BOILER", name: "Boiler" },
    { type: "FAN", name: "Exhaust Fan" },
    { type: "PANEL", name: "Electrical Panel" },
    { type: "CHILL", name: "Chiller" },
    { type: "COMP", name: "Compressor" }
  ]

  const locations = [
    "Main Library",
    "Science Building",
    "Admin Building",
    "Power House",
    "Block A Basement",
    "Student Center",
    "Engineering Hall",
    "Residence Tower A",
    "Auditorium",
    "Gymnasium"
  ]

  const zones = [
    "North Wing",
    "South Wing",
    "Roof",
    "Basement",
    "East Unit",
    "West Unit",
    "Central Unit",
    "Tower",
    "Lab",
    "Annex"
  ]

  for (let i = 1; i <= 150; i += 1) {
    const category = categories[i % categories.length]
    const location = locations[i % locations.length]
    const suffix = zones[i % zones.length]
    const equipmentId = `${category.type}-${String(i).padStart(3, "0")}`
    const name = `${suffix} ${category.name}`
    const healthScore = Math.max(10, Math.min(99, Math.round(100 - ((i * 3) % 90))))
    const status = healthScore > 80 ? "Healthy" : healthScore > 55 ? "Attention" : "Critical"
    insertEquipment.run(equipmentId, name, location, status, healthScore, category.name)
  }
  console.log("Seeded 150 equipment records.")
}

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
  const accounts = [
    { username: "reporter1", password: "report123", role: "reporter" },
    { username: "manager1", password: "manage123", role: "manager" },
    { username: "tech1", password: "tech123", role: "technician" },
    { username: "exec1", password: "exec123", role: "executive" }
  ]
  accounts.forEach((acc) => {
    const hash = bcrypt.hashSync(acc.password, 10)
    insertUser.run(acc.username, hash, acc.role)
  })
  console.log("Seeded default user accounts.")
}

module.exports = db