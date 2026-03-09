import React from "react";
import { PRIMARY, DAY_SHORTS } from "../utils/constants";
import { formatDate } from "../utils/schedule";

export default function WeekPreview({ weekClasses, weekDates, todayIndex }) {
  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      {DAY_SHORTS.map((short, dayIdx) => {
        const dayClasses = weekClasses.filter((c) => c.dayIndex === dayIdx);
        const isToday = dayIdx === todayIndex;
        const date = weekDates[dayIdx];
        return (
          <div key={short} style={{ marginBottom: 10, animation: `slideUp 0.35s ease ${dayIdx * 0.06}s both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                background: isToday ? PRIMARY : "#fff",
                color: isToday ? "#fff" : "#94A3B8",
                border: `1px solid ${isToday ? PRIMARY : "#E2E8F0"}`,
                boxShadow: isToday ? `0 2px 8px ${PRIMARY}44` : "none",
                flexShrink: 0,
              }}>{short}</div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: isToday ? "#1E293B" : "#94A3B8",
              }}>
                {formatDate(date)}
                {isToday && <span style={{ fontSize: 10, color: PRIMARY, fontWeight: 600, marginLeft: 6 }}>TODAY</span>}
              </div>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 10, color: "#CBD5E1" }}>
                {dayClasses.length === 0 ? "Free" : `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}`}
              </span>
            </div>
            {dayClasses.length === 0 ? (
              <div style={{
                marginLeft: 46, padding: "8px 14px",
                background: "#FAFBFC", border: "1px dashed #E2E8F0",
                borderRadius: 10, fontSize: 12, color: "#CBD5E1", fontStyle: "italic",
              }}>No classes</div>
            ) : (
              <div style={{ marginLeft: 46, display: "flex", flexDirection: "column", gap: 5 }}>
                {dayClasses.map((cls) => (
                  <div key={cls.id} className="hover-lift" style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", background: cls.accentBg,
                    borderLeft: `3px solid ${cls.accent}`,
                    borderRadius: "0 10px 10px 0",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}>
                    <span style={{ fontSize: 18 }}>{cls.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{cls.shortName}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>
                        📍 {cls.location} · {cls.instructor}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: cls.accent,
                        fontFamily: "'Space Mono', monospace",
                      }}>{cls.timeLabel.split("–")[0]}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'Space Mono', monospace" }}>
                        {cls.timeLabel.split("–")[1]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

