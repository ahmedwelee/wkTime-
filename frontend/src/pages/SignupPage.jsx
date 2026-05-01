import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/auth/signup", form);
      navigate("/pending");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="auth-visual alt">
          <div className="brand-mark">WK</div>
          <h1>Join your team</h1>
          <p>Create your staff account, submit your availability, and get notified when schedules are published.</p>
        </div>
        <form className="panel auth-panel" onSubmit={submit}>
          <div>
            <p className="eyebrow">Staff signup</p>
            <h2>Create account</h2>
          </div>
          <input placeholder="Full name" value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
          <input placeholder="Email address" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
          <input placeholder="Password (min 6)" type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit">Request access</button>
          <p className="muted-line">Already have account? <Link to="/login">Login</Link></p>
        </form>
      </section>
    </main>
  );
}
