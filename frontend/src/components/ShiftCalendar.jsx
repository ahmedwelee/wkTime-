import { useMemo } from "react";
import { SHIFT_TEMPLATES, formatShiftCalendarLine, formatShiftDisplayTime, getWeekDays, inferShiftCode } from "../lib/schedule";

export default function ShiftCalendar({ shifts = [], emptyLabel = "No shift" }) {
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
      const key = `${day}-${inferShiftCode(shift.startAt)}`;
      map[key] = map[key] || [];
      map[key].push(shift);
    });
    return map;
  }, [shiftsThisWeek]);

  return (
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
            const matches = shiftBySlot[`${day.date.toDateString()}-${template.code}`] || [];
            return (
              <div className={`calendar-cell accent-${template.accent} ${matches.length ? "has-shift" : "is-empty"}`} key={`${day.value}-${template.code}`}>
                {matches.length ? (
                  matches.map((match) => (
                    <article key={match.id} style={{ marginBottom: matches.length > 1 ? 10 : 0 }}>
                      <div className="calendar-employee">{match.employeeName || "Unassigned"}</div>
                      <div style={{ fontSize: "0.85rem", margin: "4px 0", color: "inherit" }}>{match.title}</div>
                      <div className="shift-times">{formatShiftCalendarLine(match.startAt, match.endAt)}</div>
                    </article>
                  ))
                ) : (
                  <span className="calendar-empty">{emptyLabel}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

