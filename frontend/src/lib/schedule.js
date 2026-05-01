export const DAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 7, short: "Sun", label: "Sunday" }
];

export const SHIFT_TEMPLATES = [
  { code: "SHIFT_1", label: "Shift 1", time: "7:00 AM - 4:00 PM", accent: "sky" },
  { code: "SHIFT_2", label: "Shift 2", time: "10:00 AM - 4:00 PM", accent: "sage" },
  { code: "SHIFT_3", label: "Shift 3", time: "4:00 PM - 11:00 PM", accent: "amber" },
  { code: "SHIFT_4", label: "Shift 4", time: "7:00 PM - 11:00 PM", accent: "violet" }
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTemplateTime(timeText) {
  const match = timeText?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "AM") {
    hour = hour === 12 ? 0 : hour;
  } else if (hour !== 12) {
    hour += 12;
  }
  return { hour, minute };
}

function formatTemplateTimePart(timeText) {
  const parsed = parseTemplateTime(timeText);
  if (!parsed) return timeText?.trim() || "";

  const period = parsed.hour >= 12 ? "PM" : "AM";
  let hour = parsed.hour % 12;
  if (hour === 0) hour = 12;
  const minute = parsed.minute === 0 ? "" : `:${pad(parsed.minute)}`;
  return `${hour}${minute} ${period}`;
}

export function formatShiftDisplayTime(timeRange) {
  if (!timeRange) return "";
  const [start, end] = String(timeRange).split(" - ");
  return `${formatTemplateTimePart(start)} - ${formatTemplateTimePart(end)}`;
}

export function buildLocalDateTime(date, timeText) {
  const parsed = parseTemplateTime(timeText);
  if (!parsed || !(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(parsed.hour)}:${pad(parsed.minute)}:00`;
}

export function getShiftTemplateRange(template) {
  if (!template?.time) return { start: "", end: "" };
  const [start, end] = template.time.split(" - ");
  return { start: start?.trim() || "", end: end?.trim() || "" };
}

export function normalizeAvailabilitySlot(slot) {
  return {
    // normalize dayOfWeek to number and accept 0..6 or 1..7 (map 0->7)
    dayOfWeek: (function(d) {
      const n = Number(d);
      if (Number.isNaN(n)) return n;
      // if backend used 0..6 (Sun=0), convert 0->7 to match app's 1..7 mapping
      return n === 0 ? 7 : n;
    })(slot?.dayOfWeek),
    shiftCode: String(slot?.shiftCode || "").toUpperCase()
  };
}

export function getSlotUserId(slot) {
  // availability entries may include userId or a nested user object
  const candidate = slot?.userId ?? slot?.user?.id ?? slot?.user?.userId;
  const n = Number(candidate);
  return Number.isNaN(n) ? null : n;
}

export function matchesAvailabilitySlot(slot, selectedSlot) {
  if (!slot || !selectedSlot) return false;
  const normalizedSlot = normalizeAvailabilitySlot(slot);
  const normalizedSelected = normalizeAvailabilitySlot(selectedSlot);
  return normalizedSlot.dayOfWeek === normalizedSelected.dayOfWeek && normalizedSlot.shiftCode === normalizedSelected.shiftCode;
}

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function formatShiftCalendarLine(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const datePart = start.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const startTime = start.toLocaleString([], {
    hour: "numeric",
    minute: "2-digit"
  });
  const endTime = end.toLocaleString([], {
    hour: "numeric",
    minute: "2-digit"
  });
  return `${datePart}, ${startTime} - ${endTime}`;
}

export function getStartOfWeek(reference = new Date()) {
  const date = new Date(reference);
  const day = date.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + delta);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getWeekDays(reference = new Date()) {
  const start = getStartOfWeek(reference);
  return DAYS.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { ...day, date };
  });
}

export function getShiftTemplateByCode(code) {
  return SHIFT_TEMPLATES.find((shift) => shift.code === code) || SHIFT_TEMPLATES[0];
}

export function inferShiftCode(startAt) {
  const hour = new Date(startAt).getHours();
  if (hour >= 19) return "SHIFT_4";
  if (hour >= 16) return "SHIFT_3";
  if (hour >= 10) return "SHIFT_2";
  return "SHIFT_1";
}
