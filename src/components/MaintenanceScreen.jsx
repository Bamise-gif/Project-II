import { useState } from "react"
import { Wrench, CheckCircle2, Hourglass, AlertTriangle, AlertOctagon, Info, XCircle } from "lucide-react"

function MaintenanceScreen({ workOrders, completeWorkOrder, equipmentList, addWorkOrder }) {
  const [activeTab, setActiveTab] = useState("tasks")
  const [equipmentSelect, setEquipmentSelect] = useState("")
  const [taskSelect, setTaskSelect] = useState("")
  const [priority, setPriority] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")

  const total = workOrders.length
  const completed = workOrders.filter((w) => w.status === "Done").length
  const inProgress = workOrders.filter((w) => w.status === "In Progress").length
  const pending = workOrders.filter((w) => w.status === "Pending").length
  const overdue = workOrders.filter((w) => w.status === "Overdue").length

  function handleSchedule() {
    if (!equipmentSelect || !taskSelect) {
      alert("Please select equipment and task.")
      return
    }
    addWorkOrder({
      asset: equipmentSelect,
      detail: taskSelect + (description ? " · " + description : ""),
      priority: priority || "Medium",
      due_date: dueDate || "TBD"
    })
    setEquipmentSelect("")
    setTaskSelect("")
    setPriority("")
    setDueDate("")
    setDescription("")
  }

  function statusClass(status) {
    if (status === "Done") return "pill pill-healthy"
    if (status === "In Progress") return "pill pill-attention"
    if (status === "Overdue") return "pill pill-critical"
    return "pill pill-pending"
  }

  function priorityColor(p) {
    if (p === "High") return "#DC2626"
    if (p === "Medium") return "#D97706"
    return "#16A34A"
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Maintenance</h1>
          <p>Manage maintenance tasks and track maintenance history.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab("schedule")}>
          + New Maintenance
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Wrench size={18} /></div>
          <div>
            <div className="kpi-label">Total Tasks</div>
            <div className="kpi-value">{total}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle2 size={18} /></div>
          <div>
            <div className="kpi-label">Completed</div>
            <div className="kpi-value" style={{ color: "#16A34A" }}>{completed}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><Hourglass size={18} /></div>
          <div>
            <div className="kpi-label">In Progress</div>
            <div className="kpi-value" style={{ color: "#D97706" }}>{inProgress + pending}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={18} /></div>
          <div>
            <div className="kpi-label">Overdue</div>
            <div className="kpi-value" style={{ color: "#DC2626" }}>{overdue}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <div className={"tab" + (activeTab === "tasks" ? " active" : "")} onClick={() => setActiveTab("tasks")}>
          Maintenance Tasks
        </div>
        <div className={"tab" + (activeTab === "history" ? " active" : "")} onClick={() => setActiveTab("history")}>
          Maintenance History
        </div>
        <div className={"tab" + (activeTab === "schedule" ? " active" : "")} onClick={() => setActiveTab("schedule")}>
          Schedule Maintenance
        </div>
      </div>

      {activeTab === "tasks" && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>Maintenance Tasks</div>
          {workOrders.filter((w) => w.status !== "Done").length === 0 && (
            <p style={{ color: "#6B7280", fontSize: "13px" }}>No active tasks.</p>
          )}
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.filter((w) => w.status !== "Done").map((w) => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 500 }}>{w.asset}</td>
                  <td style={{ color: "#6B7280", maxWidth: "200px" }}>{w.detail}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: priorityColor(w.priority) }}>
                      {w.priority || "Medium"}
                    </span>
                  </td>
                  <td><span className={statusClass(w.status)}>{w.status}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => completeWorkOrder(w.id, "real_issue")}>
                      Mark Done
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "history" && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>Maintenance History</div>
          {workOrders.filter((w) => w.status === "Done").length === 0 && (
            <p style={{ color: "#6B7280", fontSize: "13px" }}>No completed tasks yet.</p>
          )}
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Task</th>
                <th>Status</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.filter((w) => w.status === "Done").map((w) => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 500 }}>{w.asset}</td>
                  <td style={{ color: "#6B7280" }}>{w.detail}</td>
                  <td><span className="pill pill-healthy">Done</span></td>
                  <td style={{ color: "#6B7280", fontSize: "12.5px" }}>
                    {w.outcome === "real_issue" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={14} /> Confirmed real issue
                      </span>
                    ) : w.outcome === "false_alarm" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <XCircle size={14} /> False alarm
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: "16px" }}>Schedule Maintenance</div>
          <div className="grid-2">
            <div className="field">
              <label>Equipment</label>
              <select value={equipmentSelect} onChange={(e) => setEquipmentSelect(e.target.value)}>
                <option value="">Select Equipment</option>
                {equipmentList.map((e) => (
                  <option key={e.id} value={e.name}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Task</label>
              <select value={taskSelect} onChange={(e) => setTaskSelect(e.target.value)}>
                <option value="">Select Task</option>
                <option>Filter Cleaning</option>
                <option>Oil Change</option>
                <option>Bearing Inspection</option>
                <option>Gas Level Check</option>
                <option>Safety Inspection</option>
                <option>General Maintenance</option>
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Select Priority</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="field">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Enter task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSchedule}>
            Schedule Task
          </button>
        </div>
      )}
    </div>
  )
}

export default MaintenanceScreen