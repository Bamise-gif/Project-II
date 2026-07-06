const Database = require("better-sqlite3")
const db = new Database("campuspulse.db")

const equipment = [
  { id: "AC-001", name: "Library AC Unit", baseTemp: 28, baseVib: 1.2, baseCurrent: 3.2, degrading: false },
  { id: "GEN-001", name: "Main Generator", baseTemp: 52, baseVib: 2.8, baseCurrent: 7.8, degrading: true, degradeStart: 270 },
  { id: "PUMP-001", name: "Water Pump - Block A", baseTemp: 41, baseVib: 2.1, baseCurrent: 5.1, degrading: true, degradeStart: 300 },
  { id: "AC-002", name: "Science Lab AC", baseTemp: 35, baseVib: 1.8, baseCurrent: 6.0, degrading: true, degradeStart: 320 },
  { id: "LIFT-001", name: "Main Elevator", baseTemp: 29, baseVib: 1.0, baseCurrent: 2.4, degrading: false }
]

const DAYS = 365
const INTERVAL_MINUTES = 1
const READINGS_PER_DAY = (24 * 60) / INTERVAL_MINUTES
const TOTAL_READINGS = DAYS * READINGS_PER_DAY

console.log("Generating " + (TOTAL_READINGS * equipment.length).toLocaleString() + " sensor readings...")
console.log("This will take a few minutes — please wait...")

const startDate = new Date()
startDate.setFullYear(startDate.getFullYear() - 1)
startDate.setHours(0, 0, 0, 0)

const insert = db.prepare(
  "INSERT INTO sensor_readings (equipment_id, timestamp, temperature, vibration, current_draw, status) VALUES (?, ?, ?, ?, ?, ?)"
)

const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(row.equipment_id, row.timestamp, row.temperature, row.vibration, row.current_draw, row.status)
  }
})

function noise(amplitude) {
  return (Math.random() * 2 - 1) * amplitude
}

function hourlyFactor(hour) {
  if (hour >= 8 && hour <= 18) return 1.15
  if (hour >= 19 && hour <= 22) return 1.05
  return 0.9
}

function getStatus(temp, vib, current, baseTemp, baseVib, baseCurrent) {
  const tempRatio = temp / baseTemp
  const vibRatio = vib / baseVib
  if (tempRatio > 1.6 || vibRatio > 2.0) return "Critical"
  if (tempRatio > 1.3 || vibRatio > 1.5) return "Attention"
  return "Healthy"
}

let totalInserted = 0
const BATCH_SIZE = 10000

for (const eq of equipment) {
  console.log("Generating data for " + eq.id + "...")
  let batch = []

  for (let minute = 0; minute < TOTAL_READINGS; minute++) {
    const ts = new Date(startDate.getTime() + minute * 60 * 1000)
    const dayNumber = Math.floor(minute / READINGS_PER_DAY)
    const hour = ts.getHours()
    const hf = hourlyFactor(hour)

    let degradeFactor = 1.0
    if (eq.degrading && dayNumber >= eq.degradeStart) {
      const degradeProgress = (dayNumber - eq.degradeStart) / (DAYS - eq.degradeStart)
      degradeFactor = 1.0 + degradeProgress * 0.8
    }

    const temp = Math.round((eq.baseTemp * hf * degradeFactor + noise(1.5)) * 10) / 10
    const vib = Math.round((eq.baseVib * degradeFactor + noise(0.15)) * 100) / 100
    const current = Math.round((eq.baseCurrent * hf * degradeFactor + noise(0.3)) * 10) / 10
    const status = getStatus(temp, vib, current, eq.baseTemp, eq.baseVib, eq.baseCurrent)

    batch.push({
      equipment_id: eq.id,
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

  if (batch.length > 0) {
    insertMany(batch)
    totalInserted += batch.length
  }
  console.log("\n  " + eq.id + " done.")
}

console.log("\nComplete! " + totalInserted.toLocaleString() + " total rows inserted.")
db.close()