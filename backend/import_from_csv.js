const Database = require("better-sqlite3")
const fs = require("fs")
const path = require("path")

const db = new Database("campuspulse.db")

// Map CSV asset_id (1-5) to our equipment IDs
const equipmentMap = {
  1: { id: "AC-001", name: "Library AC Unit" },
  2: { id: "GEN-001", name: "Main Generator" },
  3: { id: "PUMP-001", name: "Water Pump - Block A" },
  4: { id: "AC-002", name: "Science Lab AC" },
  5: { id: "LIFT-001", name: "Main Elevator" }
}

// Clear existing sensor readings
db.exec("DELETE FROM sensor_readings")
console.log("Cleared existing sensor readings.")

// Read CSV
const csvPath = path.join(__dirname, "../ml/sensor_data.csv")
const lines = fs.readFileSync(csvPath, "utf8").split("\n")
const headers = lines[0].split(",")

console.log("Reading CSV data...")

// Parse CSV into per-asset daily data
const dailyData = {}
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  const cols = line.split(",")
  const row = {}
  headers.forEach((h, idx) => row[h.trim()] = cols[idx])

  const assetId = parseInt(row.asset_id)
  const day = parseInt(row.day)
  if (assetId < 1 || assetId > 5) continue

  if (!dailyData[assetId]) dailyData[assetId] = {}
  dailyData[assetId][day] = {
    temperature: parseFloat(row.temperature),
    vibration: parseFloat(row.vibration),
    current_draw: parseFloat(row.current_draw),
    is_anomaly: parseInt(row.is_anomaly)
  }
}

console.log("CSV parsed. Generating per-minute readings...")

const insert = db.prepare(
  "INSERT INTO sensor_readings (equipment_id, timestamp, temperature, vibration, current_draw, status) VALUES (?, ?, ?, ?, ?, ?)"
)

const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(row.equipment_id, row.timestamp, row.temperature, row.vibration, row.current_draw, row.status)
  }
})

// Start date: 90 days ago (matching CSV length)
const startDate = new Date()
startDate.setDate(startDate.getDate() - 90)
startDate.setHours(0, 0, 0, 0)

const MINUTES_PER_DAY = 24 * 60
const TOTAL_DAYS = 90
const BATCH_SIZE = 10000

let totalInserted = 0

for (const [assetIdStr, dayMap] of Object.entries(dailyData)) {
  const assetId = parseInt(assetIdStr)
  const equipment = equipmentMap[assetId]
  if (!equipment) continue

  console.log("Processing " + equipment.id + "...")
  let batch = []

  for (let day = 0; day < TOTAL_DAYS; day++) {
    const dayBase = dayMap[day]
    if (!dayBase) continue

    for (let minute = 0; minute < MINUTES_PER_DAY; minute++) {
      const ts = new Date(startDate.getTime() + (day * MINUTES_PER_DAY + minute) * 60 * 1000)
      const hour = ts.getHours()

      // Hourly variation factor — equipment runs harder during work hours
      const hourFactor = (hour >= 8 && hour <= 18) ? 1.1 : (hour >= 19 && hour <= 22) ? 1.03 : 0.92

      // Add realistic per-minute noise around the daily base value
      const temp = Math.round((dayBase.temperature * hourFactor + (Math.random() * 2 - 1) * 1.2) * 10) / 10
      const vib = Math.round((dayBase.vibration * hourFactor + (Math.random() * 2 - 1) * 0.1) * 100) / 100
      const current = Math.round((dayBase.current_draw * hourFactor + (Math.random() * 2 - 1) * 0.3) * 10) / 10

      const status = dayBase.is_anomaly === 1 ? "Attention" :
        (temp > dayBase.temperature * 1.5 || vib > dayBase.vibration * 1.8) ? "Critical" : "Healthy"

      batch.push({
        equipment_id: equipment.id,
        timestamp: ts.toISOString(),
        temperature: temp,
        vibration: vib,
        current_draw: current,
        status
      })

      if (batch.length >= BATCH_SIZE) {
        insertMany(batch)
        totalInserted += batch.length
        batch = []
        process.stdout.write("\r  " + totalInserted.toLocaleString() + " rows inserted...")
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch)
    totalInserted += batch.length
  }
  console.log("\n  " + equipment.id + " done.")
}

// Create index for fast queries
try {
  db.exec("CREATE INDEX IF NOT EXISTS idx_sensor_equipment_time ON sensor_readings (equipment_id, timestamp)")
  console.log("Index created.")
} catch (e) {}

console.log("\nComplete! " + totalInserted.toLocaleString() + " total rows inserted.")
db.close()