export default function QuickAddSlotPanel({ slot, title, notes, employees, selectedEmployeeId, saving, onTitleChange, onNotesChange, onEmployeeChange, onClose, onCreate }) {
  if (!slot) return null;

  const style = slot.anchor ? {
    top: `${slot.anchor.top}px`,
    left: `${slot.anchor.left}px`
  } : undefined;

  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <section className="panel notification-flyout quick-add-popover" style={style} onClick={(event) => event.stopPropagation()}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">Quick add</p>
            <h3>{slot.dayLabel} {slot.shiftLabel}</h3>
          </div>
          <button className="btn btn-outline btn-sm" type="button" onClick={onClose}>Close</button>
        </div>
        <div className="form">
          <input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Shift title" />
          <label>
            <span className="eyebrow">Available employees ({employees.length})</span>
            {employees.length > 0 ? (
              <div className="quick-add-employee-list" aria-label="Available employees">
                {employees.map((employee) => (
                  <span className="badge badge-ok" key={employee.id}>{employee.fullName}</span>
                ))}
              </div>
            ) : null}
            <select value={selectedEmployeeId} onChange={(event) => onEmployeeChange(event.target.value)}>
              <option value="">Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.fullName}</option>
              ))}
            </select>
          </label>
          <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Shift notes" rows="2" />
          {employees.length === 0 ? <p className="empty-state">No active employees are marked available for this shift.</p> : null}
          <div className="actions">
            <button className="btn" type="button" onClick={onCreate} disabled={saving || employees.length === 0}>
              {saving ? "Saving..." : "Create shift"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
