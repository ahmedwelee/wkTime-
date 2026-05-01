import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function PendingPage() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);

  async function load() {
    const response = await client.get("/admin/pending-users");
    setPendingUsers(response.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function approveUser(id) {
    await client.patch(`/admin/users/${id}/approve`);
    await load();
  }

  async function rejectUser(id) {
    await client.patch(`/admin/users/${id}/reject`);
    await load();
  }

  function logout() {
    localStorage.removeItem("wk_user");
    localStorage.removeItem("wk_token");
    navigate("/login");
  }

  return (
    <main className="dashboard-main">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Pending approvals</h1>
          <p>Review new account requests and approve or reject them from this page.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-outline" type="button" onClick={() => navigate("/admin")}>Back to admin</button>
          <button className="btn btn-soft" type="button" onClick={logout}>Logout</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Approvals</p>
            <h3>Pending users</h3>
          </div>
        </div>
        {pendingUsers.length === 0 ? <p className="empty-state">No pending approvals.</p> : null}
        {pendingUsers.map((user) => (
          <article className="request-card" key={user.id}>
            <div>
              <strong>{user.fullName || user.username}</strong>
              <p>{user.email}</p>
              <small>{user.role}</small>
            </div>
            <div className="actions">
              <button className="btn btn-sm" onClick={() => approveUser(user.id)}>Approve</button>
              <button className="btn btn-outline btn-sm" onClick={() => rejectUser(user.id)}>Reject</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
