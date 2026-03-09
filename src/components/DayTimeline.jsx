import React from "react";

export default function DayTimeline({ classes }) {
  if (classes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#CBD5E1", animation: "scaleIn 0.4s ease both" }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: "popIn 0.5s ease 0.1s both" }}>☀️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", marginBottom: 4, animation: "fadeIn 0.4s ease 0.2s both" }}>Free Day</div>
        <div style={{ fontSize: 12, color: "#CBD5E1", animation: "fadeIn 0.4s ease 0.3s both" }}>No classes scheduled — enjoy your time!</div>
      </div>
    );
  }

  const minH = Math.min(...classes.map((c) => c.startHour)) - 1;
  const maxH = Math.max(...classes.map((c) => c.endMin > 0 ? c.endHour + 1 : c.endHour));
  const startHour = Math.max(minH, 7);
  const endHour = maxH;
  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  const getBlockStyle = (cls) => {
    const startPos = ((cls.startHour - startHour) + cls.startMin / 60) / totalHours * 100;
    const endPos = ((cls.endHour - startHour) + cls.endMin / 60) / totalHours * 100;
    return { top: `${startPos}%`, height: `${endPos - startPos}%` };
  };

  return (
    <div style={{ display: "flex", position: "relative", height: Math.max(totalHours * 48, 160) }}>
      <div style={{ width: 42, flexShrink: 0, position: "relative" }}>
        {hours.map((hour, i) => (
          <div key={hour} style={{
            position: "absolute", top: `${(i / totalHours) * 100}%`,
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            color: "#CBD5E1", fontWeight: 500, transform: "translateY(-6px)",
          }}>{`${hour}:00`}</div>
        ))}
      </div>
      <div style={{ flex: 1, position: "relative", marginLeft: 8 }}>
        {hours.map((hour, i) => (
          <div key={hour} style={{
            position: "absolute", top: `${(i / totalHours) * 100}%`,
            left: 0, right: 0, height: 1, background: "#F1F5F9",
            animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
          }} />
        ))}
        {classes.map((cls, idx) => {
          const style = getBlockStyle(cls);
          return (
            <div key={cls.id} className="hover-lift" style={{
              position: "absolute", top: style.top, height: style.height,
              left: 0, right: 0, background: cls.accentBg,
              borderLeft: `3px solid ${cls.accent}`,
              borderRadius: "0 10px 10px 0", padding: "8px 12px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              overflow: "hidden",
              animation: `slideInLeft 0.4s ease ${idx * 0.12}s both`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 15 }}>{cls.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{cls.shortName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#64748B" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 600, color: "#475569" }}>{cls.timeLabel}</span>
                <span style={{ color: "#E11D48", fontSize: 9 }}>📍</span>
                <span>{cls.location}</span>
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{cls.instructor}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

