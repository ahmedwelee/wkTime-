import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await client.post("/auth/login", { email, password });
      localStorage.setItem("wk_token", data.token);
      localStorage.setItem("wk_user", JSON.stringify(data));
      navigate(data.role === "ADMIN" ? "/admin" : "/employee");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-visual">
          <div className="brand-mark">WK</div>
          <h1>WK Time</h1>
            <p>Employee scheduling made easy. Log in to view your schedule, submit availability, and stay updated on shift changes.</p>
        </div>
        <form className="panel auth-panel" onSubmit={submit}>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Log in to your account</h2>
          </div>
          <input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit">Login</button>
          <p className="muted-line">New here? <Link to="/signup">Create account</Link></p>
        </form>
      </section>
    </main>
  );
}
