import { useState } from "react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsSubmitting(true);
    setError("");
    const ok = await login(password);
    setIsSubmitting(false);
    if (ok) {
      onSuccess();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070d1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {/* Logo */}
      <a href="/" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={`${import.meta.env.BASE_URL}logo.jpeg`}
          alt="xnx malaf xana"
          style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover" }}
        />
        <span style={{ fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: 1 }}>xnx malaf xana</span>
      </a>

      <div style={{
        width: "100%",
        maxWidth: 360,
        background: "#0d1628",
        border: "1px solid #1e3060",
        borderRadius: 6,
        padding: "28px 24px",
      }}>
        <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 6, textAlign: "center" }}>
          Admin Panel
        </h1>
        <p style={{ color: "#666", fontSize: 13, textAlign: "center", marginBottom: 24 }}>
          Enter your password to log in
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: "100%",
                background: "#060c19",
                border: "1px solid #1e3060",
                borderRadius: 4,
                padding: "10px 40px 10px 14px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.1)",
              border: "1px solid rgba(220,50,50,0.3)",
              borderRadius: 4,
              padding: "8px 12px",
              color: "#e55",
              fontSize: 13,
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || isSubmitting}
            style={{
              background: password && !isSubmitting ? "#4d88ff" : "#0d1e3a",
              color: password && !isSubmitting ? "#fff" : "#335",
              border: "none",
              borderRadius: 4,
              padding: "11px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: password && !isSubmitting ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            {isSubmitting
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Logging in...</>
              : <><LogIn size={15} /> Log In</>
            }
          </button>
        </form>
      </div>

      <p style={{ marginTop: 20, color: "#444", fontSize: 12 }}>
        © 2025 xnx malaf xana — All rights reserved
      </p>
    </div>
  );
}
