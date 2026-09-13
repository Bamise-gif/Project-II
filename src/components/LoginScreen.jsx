import { useState } from "react"

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit() {
    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid login")
        }
        return response.json()
      })
      .then((data) => {
        onLogin(data)
      })
      .catch(() => {
        setError("Incorrect username or password.")
      })
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(160deg, #1a1530 0%, #2b1f4a 50%, #1a1530 100%)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "36px 32px",
        width: "340px",
        boxShadow: "0 0 60px rgba(124, 92, 255, 0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "84px",
            height: "84px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #6E5BFF, #8E6CFF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "700",
            fontSize: "15px",
            textAlign: "center",
            lineHeight: "1.2",
            boxShadow: "0 8px 24px rgba(110, 91, 255, 0.4)"
          }}>
            CAMPUS<br/>PULSE
          </div>
        </div>

        <h2 style={{ color: "white", textAlign: "center", fontSize: "20px", marginBottom: "4px" }}>
          Welcome back
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: "12.5px", marginBottom: "24px" }}>
          Sign in to continue to your account
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 40px 12px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                fontSize: "16px"
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>
        </div>

        {error && (
          <p style={{ color: "#FF8A8A", fontSize: "12px", marginBottom: "12px" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #6E5BFF, #8E6CFF)",
            color: "white",
            fontWeight: "600",
            fontSize: "14.5px",
            cursor: "pointer",
            marginBottom: "12px"
          }}
        >
          Log in →
        </button>

        <button
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)",
            fontWeight: "500",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          Reset
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
        </div>

        <p style={{ textAlign: "center", fontSize: "12.5px", color: "rgba(255,255,255,0.5)" }}>
          Don't have an account?{" "}
          <span style={{ color: "#9B8CFF", fontWeight: "600", cursor: "pointer" }}>Create one</span>
        </p>
      </div>
    </div>
  )
}

export default LoginScreen