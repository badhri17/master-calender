import React, { useState, useEffect, useMemo } from "react";
import semesterData from "./assets/classes.json";
import uniLogo from "./assets/uni-logo.png";

import { PRIMARY, PRIMARY_LIGHT, DAY_SHORTS, DAY_NAMES } from "./utils/constants";
import {
  WEEK_MIN, WEEK_MAX,
  getCurrentWeek, getWeekDates, getClassesForWeek,
  getTodayDayIndex, formatDate, calcTotalMinutes, formatMinutes,
} from "./utils/schedule";

import QuoteCard from "./components/QuoteCard";
import DayTimeline from "./components/DayTimeline";
import WeekPreview from "./components/WeekPreview";
import StickerBuddy from "./components/StickerBuddy";

export default function WeekCalendar() {
  const [now, setNow] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek);
  const [selectedDay, setSelectedDay] = useState(() => {
    const dates = getWeekDates(getCurrentWeek());
    const ti = getTodayDayIndex(dates);
    return ti >= 0 ? ti : 0;
  });
  const [view, setView] = useState("day");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  // Derived data
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekClasses = useMemo(() => getClassesForWeek(currentWeek), [currentWeek]);
  const todayIndex = useMemo(() => getTodayDayIndex(weekDates), [weekDates]);
  const isCurrentWeek = todayIndex >= 0;

  const dayClasses = weekClasses.filter((c) => c.dayIndex === selectedDay);

  // Stats
  const todayClasses = todayIndex >= 0 ? weekClasses.filter((c) => c.dayIndex === todayIndex) : [];
  const totalWeekMinutes = calcTotalMinutes(weekClasses);
  const freeDays = DAY_SHORTS.filter((_, i) => !weekClasses.some((c) => c.dayIndex === i)).length;
  const activeDays = 7 - freeDays;

  const weekRangeLabel = `${formatDate(weekDates[0])} – ${formatDate(weekDates[6])}`;

  // Navigation
  const goToPrevWeek = () => {
    if (currentWeek > WEEK_MIN) {
      setCurrentWeek((w) => w - 1);
      setSelectedDay(0);
    }
  };
  const goToNextWeek = () => {
    if (currentWeek < WEEK_MAX) {
      setCurrentWeek((w) => w + 1);
      setSelectedDay(0);
    }
  };
  const goToToday = () => {
    const wk = getCurrentWeek();
    setCurrentWeek(wk);
    const dates = getWeekDates(wk);
    const ti = getTodayDayIndex(dates);
    setSelectedDay(ti >= 0 ? ti : 0);
    setView("day");
  };

  // Next Up (only if viewing today)
  const getNextUp = () => {
    if (!isCurrentWeek || selectedDay !== todayIndex) return null;
    const mins = h * 60 + m;
    const sorted = [...todayClasses].sort((a, b) => (a.startHour * 60 + a.startMin) - (b.startHour * 60 + b.startMin));
    for (const cls of sorted) {
      const start = cls.startHour * 60 + cls.startMin;
      const end = cls.endHour * 60 + cls.endMin;
      if (mins < start) return { cls, label: `${cls.shortName} at ${cls.timeLabel.split("–")[0]}`, status: "next" };
      if (mins < end) return { cls, label: `${cls.shortName} (in session)`, status: "live" };
    }
    return null;
  };

  const nextUp = view === "day" ? getNextUp() : null;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#F4F6FB",
      minHeight: "100vh",
      color: "#1E293B",
      padding: "24px 20px",
      boxSizing: "border-box",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8); }
          70% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .hover-scale { transition: transform 0.15s ease; }
        .hover-scale:hover { transform: scale(1.05); }
        .hover-glow { transition: all 0.2s ease; }
        .hover-glow:hover { box-shadow: 0 0 20px rgba(212,81,59,0.15); }

        /* ── Sticker Buddy ── */
        .sticker-buddy {
          position: fixed;
          right: 40px;
          top: 110px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }
        .sticker-frame {
          width: 140px;
          height: 140px;
          border-radius: 22px;
          border: 5px solid white;
          box-shadow: 0 6px 30px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          transform: rotate(4deg);
        }
        .sticker-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .sticker-bubble {
          background: white;
          border-radius: 18px 18px 6px 18px;
          padding: 10px 16px;
          box-shadow: 0 3px 16px rgba(0,0,0,0.1);
          text-align: center;
          position: relative;
          max-width: 165px;
        }
        .bubble-tail {
          position: absolute;
          bottom: -9px;
          right: 22px;
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 11px solid white;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.04));
        }

        /* Sticker Animations */
        @keyframes stickerPopUp {
          0%   { opacity: 0; transform: translateY(80px) scale(0.5) rotate(20deg); }
          55%  { opacity: 1; transform: translateY(-12px) scale(1.1) rotate(-4deg); }
          78%  { transform: translateY(4px) scale(0.97) rotate(1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes stickerDisappear {
          0%   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          25%  { opacity: 0.9; transform: translateY(-18px) scale(1.07) rotate(-3deg); }
          100% { opacity: 0; transform: translateY(80px) scale(0.3) rotate(20deg); }
        }
        @keyframes bubblePopIn {
          0%   { opacity: 0; transform: scale(0.3) translateY(10px); }
          65%  { opacity: 1; transform: scale(1.1) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bubbleFadeOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3) translateY(10px); }
        }

        .sticker-in  { animation: stickerPopUp 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .sticker-out { animation: stickerDisappear 0.65s ease forwards; }
        .sticker-bubble-in  { animation: bubblePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
        .sticker-bubble-out { animation: bubbleFadeOut 0.25s ease forwards; }

        /* Mobile: absolute on the day/week view card, right side */
        @media (max-width: 768px) {
          .sticker-buddy {
            position: absolute;
            right: -6px;
            top: -28px;
            flex-direction: row;
            align-items: flex-end;
            gap: 5px;
            z-index: 10;
          }
          .sticker-frame {
            width: 54px;
            height: 54px;
            border-radius: 14px;
            border: 3px solid white;
            box-shadow: 0 3px 14px rgba(0,0,0,0.14);
            flex-shrink: 0;
          }
          .sticker-bubble {
            padding: 4px 8px;
            border-radius: 10px 10px 10px 3px;
            max-width: 115px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .sticker-bubble span { font-size: 9px !important; }
          .sticker-bubble strong { font-size: 10px !important; }
          .bubble-tail {
            bottom: auto;
            left: auto;
            right: -7px;
            top: 8px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 8px solid white;
            border-right: none;
          }
        }
      `}</style>

      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        {/* University Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 14,
          animation: "slideDown 0.4s ease both",
        }}>
          <img
            src={uniLogo}
            alt={semesterData.university}
            style={{
              width: 38, height: 38, borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <div>
            <div style={{
              fontSize: 15, fontWeight: 800, color: "#1E293B", letterSpacing: "-0.3px", lineHeight: 1.2,
            }}>
              {semesterData.university}
            </div>
            <div style={{
              fontSize: 11, color: "#94A3B8", fontWeight: 500, lineHeight: 1.2,
            }}>
              {semesterData.program} · {semesterData.semester}
            </div>
          </div>
        </div>

        <QuoteCard />

        {/* Header with week navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, animation: "slideUp 0.4s ease 0.1s both" }}>
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
            }}>
              <button onClick={goToPrevWeek} disabled={currentWeek <= WEEK_MIN} style={{
                width: 26, height: 26, borderRadius: 8, border: "1px solid #E2E8F0",
                background: currentWeek <= WEEK_MIN ? "#F8FAFC" : "#fff",
                color: currentWeek <= WEEK_MIN ? "#CBD5E1" : "#64748B",
                fontSize: 13, fontWeight: 700, cursor: currentWeek <= WEEK_MIN ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>‹</button>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "2px", color: "#94A3B8",
              }}>Week {currentWeek} · {semesterData.semester}</div>
              <button onClick={goToNextWeek} disabled={currentWeek >= WEEK_MAX} style={{
                width: 26, height: 26, borderRadius: 8, border: "1px solid #E2E8F0",
                background: currentWeek >= WEEK_MAX ? "#F8FAFC" : "#fff",
                color: currentWeek >= WEEK_MAX ? "#CBD5E1" : "#64748B",
                fontSize: 13, fontWeight: 700, cursor: currentWeek >= WEEK_MAX ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>›</button>
              {!isCurrentWeek && (
                <button onClick={goToToday} style={{
                  padding: "3px 10px", borderRadius: 7, border: `1px solid ${PRIMARY}44`,
                  background: PRIMARY_LIGHT, color: PRIMARY,
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}>Today</button>
              )}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1E293B", letterSpacing: "-0.5px" }}>
              {view === "week"
                ? "Week Overview"
                : `${DAY_NAMES[selectedDay]}, ${formatDate(weekDates[selectedDay])}`}
            </h1>
            <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>
              {weekRangeLabel}
            </div>
          </div>
          <div style={{
            background: PRIMARY, borderRadius: 12, padding: "8px 14px", textAlign: "center",
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: "#fff",
              fontFamily: "'Space Mono', monospace", letterSpacing: "-1px", lineHeight: 1,
            }}>{timeStr}</div>
            <div style={{ fontSize: 9, color: "#FECACA", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              current time
            </div>
          </div>
        </div>

        {/* Next Up */}
        {nextUp && (
          <div className="hover-lift" style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 14, padding: "14px 16px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animation: "scaleIn 0.35s ease both",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: nextUp.cls.accentBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>{nextUp.cls.icon}</div>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: nextUp.status === "live" ? nextUp.cls.accent : PRIMARY,
                display: "flex", alignItems: "center", gap: 5, marginBottom: 2,
              }}>
                {nextUp.status === "live" && (
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: nextUp.cls.accent, animation: "pulse 2s infinite",
                  }} />
                )}
                {nextUp.status === "live" ? "In Session" : "Next Up"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{nextUp.label}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                {nextUp.cls.location} · {nextUp.cls.instructor}
              </div>
            </div>
          </div>
        )}

        {/* Day pills + view toggle */}
        <div style={{
          background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 14, padding: "12px 10px", marginBottom: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          animation: "slideUp 0.4s ease 0.15s both",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, gap: 4 }}>
            {["day", "week"].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "4px 16px", borderRadius: 8, border: "none",
                background: view === v ? PRIMARY_LIGHT : "transparent",
                color: view === v ? PRIMARY : "#94A3B8",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.8px",
                transition: "all 0.15s",
              }}>{v === "day" ? "Day View" : "Week View"}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {DAY_SHORTS.map((short, i) => {
              const isSelected = view === "day" && i === selectedDay;
              const isTodayPill = i === todayIndex;
              const hasClass = weekClasses.some((c) => c.dayIndex === i);
              const date = weekDates[i];
              return (
                <div key={short} onClick={() => { setSelectedDay(i); setView("day"); }}
                  className="hover-scale"
                  style={{ textAlign: "center", flex: 1, cursor: "pointer", animation: `popIn 0.3s ease ${i * 0.04}s both` }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.5px",
                    color: isSelected ? PRIMARY : isTodayPill && view === "week" ? PRIMARY : "#94A3B8",
                    marginBottom: 4,
                  }}>{short}</div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto", fontSize: 16, fontWeight: 800,
                    fontFamily: "'Space Mono', monospace",
                    background: isSelected ? PRIMARY : "transparent",
                    color: isSelected ? "#fff" : "#64748B",
                    boxShadow: isSelected ? `0 2px 8px ${PRIMARY}44` : "none",
                    transition: "all 0.2s",
                    border: isTodayPill && !isSelected ? `1.5px solid ${PRIMARY}44` : "1.5px solid transparent",
                  }}>{date.getDate()}</div>
                  {hasClass && (
                    <div style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: isSelected ? PRIMARY : "#CBD5E1",
                      margin: "5px auto 0",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content – position:relative so sticker can be absolute on mobile */}
        <div style={{ position: "relative" }}>
          <StickerBuddy hasClasses={view === "day" && dayClasses.length > 0} />
        {view === "week" ? (
          <div style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 14, padding: "18px 16px", marginBottom: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              animation: "scaleIn 0.3s ease both",
          }}>
              <WeekPreview weekClasses={weekClasses} weekDates={weekDates} todayIndex={todayIndex} />
          </div>
        ) : (
          <div style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 14, padding: "18px 16px", marginBottom: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              animation: "scaleIn 0.3s ease both",
          }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
                  {selectedDay === todayIndex && isCurrentWeek ? "Today" : DAY_NAMES[selectedDay]}, {formatDate(weekDates[selectedDay])}
              </span>
              <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 8 }}>
                {dayClasses.length === 0 ? "No classes" : `${dayClasses.length} class${dayClasses.length > 1 ? "es" : ""}`}
              </span>
            </div>
              <DayTimeline classes={dayClasses} />
          </div>
        )}
        </div>

        {/* Bottom Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            {
              label: isCurrentWeek ? "TODAY" : DAY_SHORTS[selectedDay],
              value: String(dayClasses.length),
              sub: dayClasses.length === 1 ? "class" : "classes",
              detail: dayClasses.length > 0
                ? `${dayClasses[0].timeLabel.split("–")[0]}–${dayClasses[dayClasses.length - 1].timeLabel.split("–")[1]}`
                : "Free day",
              accent: PRIMARY,
              borderAccent: PRIMARY,
            },
            {
              label: "WEEK TOTAL",
              value: formatMinutes(totalWeekMinutes),
              sub: `${weekClasses.length} session${weekClasses.length !== 1 ? "s" : ""}`,
              detail: null,
              accent: "#10B981",
              borderAccent: "#10B981",
            },
            {
              label: "FREE DAYS",
              value: String(freeDays),
              sub: "of 7",
              detail: activeDays > 0 ? `${activeDays} active day${activeDays !== 1 ? "s" : ""}` : "All free!",
              accent: "#F59E0B",
              borderAccent: "#F59E0B",
            },
          ].map((stat, i) => (
            <div key={i} className="hover-lift" style={{
              background: "#fff", border: "1px solid #E2E8F0",
              borderBottom: `3px solid ${stat.borderAccent}`,
              borderRadius: 12, padding: "10px 8px", textAlign: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              animation: `slideUp 0.35s ease ${0.25 + i * 0.08}s both`,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.2px", color: "#94A3B8", marginBottom: 4,
              }}>{stat.label}</div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: stat.accent,
                  fontFamily: "'Space Mono', monospace", lineHeight: 1,
                whiteSpace: "nowrap",
              }}>{stat.value}</div>
              {stat.sub && <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500, marginTop: 3 }}>{stat.sub}</div>}
              {stat.detail && (
                <div style={{
                  fontSize: 9, color: "#CBD5E1", marginTop: 2,
                  fontFamily: "'Space Mono', monospace",
                }}>{stat.detail}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
