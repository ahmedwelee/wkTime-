import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import ShiftCalendar from "../components/ShiftCalendar";

function NotificationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-bell">
      <path
        d="M12 3a4 4 0 0 0-4 4v2.2c0 1-.4 2-1.1 2.8L5.7 13.4A1 1 0 0 0 6.5 15h11a1 1 0 0 0 .8-1.6l-1.2-1.4A4.5 4.5 0 0 1 16 9.2V7a4 4 0 0 0-4-4Zm0 18a2.5 2.5 0 0 0 2.3-1.5h-4.6A2.5 2.5 0 0 0 12 21Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function EmployeeCalendarPage() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  async function load() {
    if (loading) return;
    setLoading(true);
    try {
      const [shiftRes, notifRes] = await Promise.all([
        client.get("/shifts"),
        client.get("/notifications/mine")
      ]);
      setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : []);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (error) {
      console.error("EmployeeCalendarPage load error:", error);
      // Fallback to /shifts/mine if /shifts is not allowed or fails
      try {
        const shiftRes = await client.get("/shifts/mine");
        setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : []);
      } catch (mineError) {
        console.error("Fallback to /shifts/mine also failed:", mineError);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  function logout() {
    localStorage.removeItem("wk_user");
    localStorage.removeItem("wk_token");
    navigate("/login");
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">WK</div>
          <div>
            <strong>WK Time</strong>
            <p>Team schedule</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button type="button" className="nav-pill" onClick={() => navigate("/employee")}>Dashboard</button>
          <button type="button" className="nav-pill active">Team calendar</button>
        </nav>
      </aside>

      <main className="employee-shell">
        <section className="top-navbar">
          <div>
            <p className="eyebrow">Employee</p>
            <h2>Team shift calendar</h2>
          </div>
          <div className="top-navbar-actions">
            <button className="icon-btn" type="button" onClick={() => navigate("/employee") }>
              <NotificationIcon />
              {unreadCount > 0 ? <span className="icon-count">{unreadCount}</span> : null}
            </button>
            <button className="btn btn-soft btn-sm" type="button" onClick={() => navigate("/employee")}>Back to dashboard</button>
            <button className="btn btn-outline btn-sm" type="button" onClick={logout}>Logout</button>
          </div>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div className="panel-head">
            <div>
              <p className="eyebrow">Calendar view</p>
              <h3>This week</h3>
            </div>
            <div>
              <span className="badge">{shifts.length} team shifts</span>
            </div>
          </div>
          {loading && shifts.length === 0 ? <p className="empty-state">Loading calendar...</p> : null}
          {!loading && shifts.length === 0 ? <p className="empty-state">No shifts assigned yet.</p> : null}
          <ShiftCalendar shifts={shifts} emptyLabel="No shift" />
        </section>

      </main>
    </div>
  );
}

