import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import QuickAddSlotPanel from "../components/QuickAddSlotPanel";
import {
  DAYS,
  SHIFT_TEMPLATES,
  buildLocalDateTime,
  formatDateTime,
  formatShiftDisplayTime,
  getShiftTemplateByCode,
  getShiftTemplateRange,
  getWeekDays,
  inferShiftCode,
  matchesAvailabilitySlot,
  getSlotUserId
} from "../lib/schedule";

const navItems = [
  { id: "schedule", label: "Schedule" },
  { id: "availability", label: "Availability" }
];

function shiftBadge(status) {
  return status === "OPEN" ? "badge badge-warn" : "badge badge-ok";
}

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

export default function AdminPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeAccounts, setEmployeeAccounts] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [shifts, setShifts] = useState([]);
   const [notifications, setNotifications] = useState([]);
   const [activeSection, setActiveSection] = useState("schedule");
   const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [slotTitle, setSlotTitle] = useState("");
  const [slotNotes, setSlotNotes] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);
  const [loading, setLoading] = useState(false);

  const weekDays = getWeekDays();

  async function load() {
    if (loading) return;
    setLoading(true);
    try {
      // Use Promise.allSettled so one failing endpoint doesn't hide the others;
      // log detailed errors so we can see which request returns 500.
      const requests = [
        client.get("/users/active-employees"),
        client.get("/shifts"),
        client.get("/availability"),
        client.get("/notifications/mine")
      ];
      const results = await Promise.allSettled(requests);

      const [employeesRes, shiftsRes, availabilityRes, notificationRes] = results;

      if (employeesRes.status === "fulfilled") {
        const empAccounts = Array.isArray(employeesRes.value.data)
          ? employeesRes.value.data.map((emp) => ({ ...emp, status: emp.status || "ACTIVE" }))
          : [];
        setEmployees(empAccounts);
        setEmployeeAccounts(empAccounts);
      } else {
        console.error("Failed to load employees:", employeesRes.reason);
      }

      if (shiftsRes.status === "fulfilled") {
        setShifts(Array.isArray(shiftsRes.value.data) ? shiftsRes.value.data : []);
      } else {
        console.error("Failed to load shifts:", shiftsRes.reason);
      }

      if (availabilityRes.status === "fulfilled") {
        setAvailability(Array.isArray(availabilityRes.value.data) ? availabilityRes.value.data : []);
      } else {
        console.error("Failed to load availability:", availabilityRes.reason);
      }

      if (notificationRes.status === "fulfilled") {
        setNotifications(Array.isArray(notificationRes.value.data) ? notificationRes.value.data : []);
      } else {
        console.error("Failed to load notifications:", notificationRes.reason);
      }

    } catch (error) {
      // Fallback: log any unexpected error that escaped the settled handling
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markNotificationRead(id) {
    try {
      await client.patch(`/notifications/${id}/read`);
      await load();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  function logout() {
    localStorage.removeItem("wk_user");
    localStorage.removeItem("wk_token");
    navigate("/login");
  }

  const employeeList = employeeAccounts;

  const groupedAvailability = useMemo(() => {
    try {
      if (!employeeList.length) return [];
      return employeeList.map((employee) => ({
        ...employee,
        // be tolerant of availability shapes: slot.userId or slot.user.id
        slots: availability.filter((slot) => getSlotUserId(slot) === Number(employee.id))
      }));
    } catch (error) {
      console.error("groupedAvailability error:", error);
      return [];
    }
  }, [employeeList, availability]);

  const availabilityByEmployeeId = useMemo(() => {
    return new Map(groupedAvailability.map((employee) => [employee.id, employee.slots]));
  }, [groupedAvailability]);

  const shiftsThisWeek = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startAt);
    return weekDays.some((day) => shiftDate.toDateString() === day.date.toDateString());
  });

  const openShiftCount = shifts.filter((shift) => shift.status === "OPEN").length;
  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const publishedShiftCount = shifts.filter((shift) => shift.published).length;
  const employeesWithAvailabilityCount = groupedAvailability.filter((employee) => employee.status === "ACTIVE" && employee.slots.length > 0).length;

  const shiftBySlot = useMemo(() => {
    const map = {};
    shiftsThisWeek.forEach((shift) => {
      const day = new Date(shift.startAt).toDateString();
      map[`${day}-${inferShiftCode(shift.startAt)}`] = shift;
    });
    return map;
  }, [shiftsThisWeek]);

  const availableEmployeesForSelectedSlot = useMemo(() => {
    if (!selectedSlot) return [];
    return employeeAccounts.filter((employee) => {
      if (employee.status !== "ACTIVE") return false;
      const availabilityForEmployee = availabilityByEmployeeId.get(employee.id) || [];
      return availabilityForEmployee.some((slot) => matchesAvailabilitySlot(slot, selectedSlot));
    });
  }, [selectedSlot, employeeAccounts, availabilityByEmployeeId]);

  function openEmptySlot(day, template, event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedSlot({
      dayOfWeek: day.value,
      shiftCode: template.code,
      dayLabel: day.short,
      shiftLabel: template.label,
      startAt: template.time,
      anchor: { top: rect.bottom + 8, left: rect.left }
    });
    setSelectedEmployeeId("");
    setSlotTitle(`${day.short} ${template.label}`);
    setSlotNotes("");
  }

  function closeSlotDialog() {
    setSelectedSlot(null);
    setSelectedEmployeeId("");
    setSlotTitle("");
    setSlotNotes("");
  }

  async function createShiftFromSlot() {
    if (!selectedSlot) return;
    setSavingSlot(true);
    try {
      const weekDay = weekDays.find((day) => day.value === selectedSlot.dayOfWeek);
      const template = SHIFT_TEMPLATES.find((shift) => shift.code === selectedSlot.shiftCode);
      const templateRange = getShiftTemplateRange(template);
      const startAt = weekDay && templateRange.start ? buildLocalDateTime(weekDay.date, templateRange.start) : "";
      const endAt = weekDay && templateRange.end ? buildLocalDateTime(weekDay.date, templateRange.end) : "";
      // Basic client-side validation to avoid sending invalid datetimes which cause server 500
      if (!startAt || !endAt) {
        console.error("Invalid shift times: startAt or endAt missing", { startAt, endAt });
        alert("Could not determine valid start or end time for this shift. Please try again.");
        return;
      }
      // verify date parsing
      if (Number.isNaN(new Date(startAt).getTime()) || Number.isNaN(new Date(endAt).getTime())) {
        console.error("Invalid ISO datetimes", { startAt, endAt });
        alert("Shift times are invalid. Please refresh and try again.");
        return;
      }
      const resp = await client.post("/shifts", {
        title: slotTitle || `${selectedSlot.dayLabel} ${selectedSlot.shiftLabel}`,
        startAt,
        endAt,
        notes: slotNotes,
        employeeId: selectedEmployeeId ? Number(selectedEmployeeId) : null,
        published: true
      });
      console.log("createShift response:", resp.data);
      closeSlotDialog();
      await load();
    } catch (error) {
      console.error("Error creating shift:", error);
      // show backend error message when available
      const msg = error?.response?.data?.message || error?.message || "Could not create shift";
      alert(msg);
    } finally {
      setSavingSlot(false);
    }
  }

  function statusBadge(status) {
    if (status === "ACTIVE") return "badge badge-ok";
    if (status === "INACTIVE") return "badge badge-warn";
    if (status === "PENDING") return "badge";
    return "badge badge-danger";
  }

  // Show loading state
  if (loading && employeeAccounts.length === 0) {
    return (
        <div className="dashboard-shell">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Loading...</div>
          </div>
        </div>
    );
  }

  return (
      <div className="dashboard-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">WK</div>
            <div>
              <strong>WK Time</strong>
              <p>Admin control center</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
                <button key={item.id} type="button" className={`nav-pill ${activeSection === item.id ? "active" : ""}`} onClick={() => setActiveSection(item.id)}>
                  {item.label}
                </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <section className="top-navbar">
            <div>
              <p className="eyebrow">Admin</p>
              <h2>{navItems.find((item) => item.id === activeSection)?.label || "Schedule"}</h2>
            </div>
            <div className="top-navbar-actions">
              <button className="btn btn-soft btn-sm" type="button" onClick={() => navigate("/pending")}>Pending approvals</button>
              <button className="icon-btn" type="button" onClick={() => setShowNotifications((current) => !current)}>
                <NotificationIcon />
                {unreadNotifications > 0 ? <span className="icon-count">{unreadNotifications}</span> : null}
              </button>
              <button className="btn btn-outline" type="button" onClick={logout}>Logout</button>
            </div>
          </section>

          <section className="mobile-section-nav">
            {navItems.map((item) => (
                <button key={item.id} type="button" className={`mobile-section-chip ${activeSection === item.id ? "active" : ""}`} onClick={() => setActiveSection(item.id)}>
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
                        <strong>{notification.type?.replaceAll("_", " ") || "Notification"}</strong>
                        <p>{notification.message}</p>
                        <small>{formatDateTime(notification.createdAt)}</small>
                      </div>
                      {!notification.isRead ? <button className="btn btn-soft btn-sm" onClick={() => markNotificationRead(notification.id)}>Mark read</button> : null}
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
                              <button
                                  type="button"
                                  className={`calendar-cell accent-${template.accent} ${match ? "has-shift" : "is-empty"}`}
                                  key={`${day.value}-${template.code}`}
                                  onClick={(event) => !match && openEmptySlot(day, template, event)}
                              >
                                {match ? (
                                    <>
                                      <div className="calendar-employee">{match.employeeName}</div>
                                      <div className={shiftBadge(match.status)}>{match.status === "OPEN" ? "Open" : "Assigned"}</div>
                                    </>
                                ) : (
                                    <span className="calendar-empty">No shift</span>
                                )}
                              </button>
                          );
                        })}
                      </div>
                  ))}
                </div>
              </section>
          ) : null}

          {selectedSlot ? (
              <QuickAddSlotPanel
                  slot={selectedSlot}
                  title={slotTitle}
                  notes={slotNotes}
                  employees={availableEmployeesForSelectedSlot}
                  selectedEmployeeId={selectedEmployeeId}
                  saving={savingSlot}
                  onTitleChange={setSlotTitle}
                  onNotesChange={setSlotNotes}
                  onEmployeeChange={setSelectedEmployeeId}
                  onClose={closeSlotDialog}
                  onCreate={createShiftFromSlot}
              />
          ) : null}

          {activeSection === "availability" ? (
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Availability</p>
                    <h3>Team coverage matrix</h3>
                  </div>
                </div>
                <div className="availability-list">
                  {groupedAvailability.length === 0 ? (
                      <p className="empty-state">No availability data found.</p>
                  ) : (
                      groupedAvailability.map((employee) => (
                          <article className="availability-card" key={employee.id}>
                            <strong>{employee.fullName}</strong>
                            <div className="availability-tags">
                              {employee.slots.length === 0 ? <span className="badge">No availability yet</span> : null}
                              {employee.slots.map((slot) => {
                                const day = DAYS.find((item) => item.value === slot.dayOfWeek);
                                const template = getShiftTemplateByCode(slot.shiftCode);
                                return <span className={`badge accent-${template?.accent || 'default'}`} key={slot.id}>{day?.short} {template?.label || slot.shiftCode}</span>;
                              })}
                            </div>
                          </article>
                      ))
                  )}
                </div>
              </section>
          ) : null}

        </main>
      </div>
  );
}