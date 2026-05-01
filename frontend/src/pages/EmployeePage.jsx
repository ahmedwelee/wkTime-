import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { DAYS, SHIFT_TEMPLATES, formatDateTime, formatShiftCalendarLine, formatShiftDisplayTime, inferShiftCode, getWeekDays } from "../lib/schedule";

const employeeNavItems = [
  { id: "schedule", label: "Schedule" },
  { id: "availability", label: "Availability" },
  { id: "calendar", label: "Team Calendar" }
];

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

function buildSlotMap(entries) {
  const map = {};
  entries.forEach((entry) => {
    map[`${entry.dayOfWeek}-${entry.shiftCode}`] = true;
  });
  return map;
}

export default function EmployeePage() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState("schedule");
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const weekDays = getWeekDays();

  const shiftsThisWeek = useMemo(() => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startAt);
      return weekDays.some((day) => shiftDate.toDateString() === day.date.toDateString());
    });
  }, [shifts, weekDays]);

  const shiftBySlot = useMemo(() => {
    const map = {};
    shiftsThisWeek.forEach((shift) => {
      const day = new Date(shift.startAt).toDateString();
      map[`${day}-${inferShiftCode(shift.startAt)}`] = shift;
    });
    return map;
  }, [shiftsThisWeek]);

  async function loadAvailability() {
    const availabilityRes = await client.get("/availability/mine");
    setSelectedSlots(buildSlotMap(availabilityRes.data));
  }

  async function load() {
    const [shiftRes, notifRes, availabilityRes] = await Promise.all([
      client.get("/shifts/mine"),
      client.get("/notifications/mine"),
      client.get("/availability/mine")
    ]);
    setShifts(shiftRes.data);
    setNotifications(notifRes.data);
    setSelectedSlots(buildSlotMap(availabilityRes.data));
  }

  useEffect(() => {
    load();
    // Poll for updates so newly-created shifts (by admin) appear in the employee calendar
    const id = setInterval(() => {
      load();
    }, 10_000); // every 10 seconds
    return () => clearInterval(id);
  }, []);

  function toggleSlot(dayOfWeek, shiftCode) {
    const key = `${dayOfWeek}-${shiftCode}`;
    setSelectedSlots((current) => ({ ...current, [key]: !current[key] }));
  }

  async function saveAvailability() {
    setSavingAvailability(true);
    setAvailabilityError("");
    try {
      const slots = Object.entries(selectedSlots)
        .filter(([, checked]) => checked)
        .map(([key]) => {
          const [dayOfWeek, shiftCode] = key.split("-");
          return { dayOfWeek: Number(dayOfWeek), shiftCode };
        });
      const response = await client.post("/availability/mine", { slots });
      if (Array.isArray(response.data)) {
        setSelectedSlots(buildSlotMap(response.data));
      } else {
        await loadAvailability();
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      setAvailabilityError(error?.response?.data?.message || "Could not save availability. Please try again.");
    } finally {
      setSavingAvailability(false);
    }
  }

  async function markRead(id) {
    await client.patch(`/notifications/${id}/read`);
    await load();
  }

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
            <p>Employee workspace</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {employeeNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-pill ${activeSection === item.id ? "active" : ""}`}
                onClick={() => {
                  if (item.id === "calendar") {
                    navigate("/employee/calendar");
                  } else {
                    setActiveSection(item.id);
                  }
                }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="employee-shell">
        <section className="top-navbar">
          <div>
            <p className="eyebrow">Employee</p>
            <h2>{employeeNavItems.find((item) => item.id === activeSection)?.label || "Schedule"}</h2>
          </div>
          <div className="top-navbar-actions">
            <button className="icon-btn" type="button" onClick={() => setShowNotifications((current) => !current)}>
              <NotificationIcon />
              {unreadCount > 0 ? <span className="icon-count">{unreadCount}</span> : null}
            </button>
            <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
          </div>
        </section>

        <section className="mobile-section-nav">
          {employeeNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-section-chip ${activeSection === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.id === "calendar") {
                  navigate("/employee/calendar");
                } else {
                  setActiveSection(item.id);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </section>

        {showNotifications ? (
          <section className="panel notification-flyout">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Notifications</p>
                <h3>Recent alerts</h3>
              </div>
            </div>
            {notifications.length === 0 ? <p className="empty-state">No notifications yet.</p> : null}
            {notifications.map((notification) => (
              <article className={`notification-card ${notification.isRead ? "is-read" : ""}`} key={notification.id}>
                <div>
                  <strong>{notification.type.replaceAll("_", " ")}</strong>
                  <p>{notification.message}</p>
                  <small>{formatDateTime(notification.createdAt)}</small>
                </div>
                {!notification.isRead ? <button className="btn btn-soft btn-sm" onClick={() => markRead(notification.id)}>Mark read</button> : null}
              </article>
            ))}
          </section>
        ) : null}


        {activeSection === "schedule" ? (
          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Calendar view</p>
                <h3>This week</h3>
              </div>
            </div>
            <div className="calendar-grid">
              <div className="calendar-time-column">
                <div className="calendar-shift-label calendar-shift-header">
                  <strong>Shifts</strong>
                </div>
                {SHIFT_TEMPLATES.map((shift) => (
                  <div className="calendar-shift-label" key={shift.code}>
                    <strong>{formatShiftDisplayTime(shift.time)}</strong>
                  </div>
                ))}
              </div>
              {weekDays.map((day) => (
                <div className="calendar-column" key={day.value}>
                  <div className="calendar-day-head">
                    <strong>{day.short}</strong>
                    <span>{day.date.getDate()}</span>
                  </div>
                  {SHIFT_TEMPLATES.map((template) => {
                    const match = shiftBySlot[`${day.date.toDateString()}-${template.code}`];
                    return (
                      <div className={`calendar-cell accent-${template.accent} ${match ? "has-shift" : "is-empty"}`} key={`${day.value}-${template.code}`}>
                        {match ? (
                          <>
                            <div className="calendar-employee">{match.employeeName}</div>
                            <div className="shift-times">{formatShiftCalendarLine(match.startAt, match.endAt)}</div>
                          </>
                        ) : (
                          <span className="calendar-empty">No shift</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "availability" ? (
          <section className="panel mobile-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Availability</p>
                <h3>Submit weekly slots</h3>
              </div>
            </div>
            <div className="availability-table">
              <div className="availability-row heading">
                <span>Day</span>
                {SHIFT_TEMPLATES.map((shift) => <span key={shift.code}>{shift.time}</span>)}
              </div>
              {DAYS.map((day) => (
                <div className="availability-row" key={day.value}>
                  <span>{day.short}</span>
                  {SHIFT_TEMPLATES.map((shift) => {
                    const key = `${day.value}-${shift.code}`;
                    return (
                      <label className="availability-check" key={key}>
                        <input type="checkbox" checked={Boolean(selectedSlots[key])} onChange={() => toggleSlot(day.value, shift.code)} />
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            {availabilityError ? <p className="empty-state" role="alert">{availabilityError}</p> : null}
            <button className="btn" type="button" onClick={saveAvailability} disabled={savingAvailability}>
              {savingAvailability ? "Saving..." : "Save availability"}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
