import semesterData from "../assets/classes.json";
import { MONTH_NAMES } from "./constants";

const SEMESTER_START = new Date(semesterData.semesterStartDate + "T00:00:00");
export const WEEK_MIN = semesterData.weeksRange[0];
export const WEEK_MAX = semesterData.weeksRange[1];

const courseMap = {};
semesterData.courses.forEach((c) => { courseMap[c.id] = c; });

export function getWeekNumber(date) {
  const diff = date - SEMESTER_START;
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}

export function getCurrentWeek() {
  const wk = getWeekNumber(new Date());
  if (wk < WEEK_MIN) return WEEK_MIN;
  if (wk > WEEK_MAX) return WEEK_MIN;
  return wk;
}

export function getWeekDates(weekNum) {
  const weekStart = new Date(SEMESTER_START);
  weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return { hour: h, min: m };
}

export function getClassesForWeek(weekNum) {
  return semesterData.schedule
    .filter((s) => weekNum >= s.weeks[0] && weekNum <= s.weeks[1])
    .map((s, idx) => {
      const course = courseMap[s.courseId];
      const start = parseTime(s.startTime);
      const end = parseTime(s.endTime);
      return {
        id: `${s.courseId}-${s.day}-${idx}`,
        courseId: s.courseId,
        dayIndex: s.day,
        shortName: course.name.length > 25 ? course.name.slice(0, 22) + "…" : course.name,
        fullName: course.name,
        instructor: course.instructor,
        location: course.location,
        icon: course.icon,
        accent: course.accent,
        accentBg: course.accentBg,
        startHour: start.hour,
        startMin: start.min,
        endHour: end.hour,
        endMin: end.min,
        timeLabel: `${s.startTime}–${s.endTime}`,
        sections: s.sections,
      };
    });
}

export function getTodayDayIndex(weekDates) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  for (let i = 0; i < weekDates.length; i++) {
    const d = weekDates[i];
    const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dStr === todayStr) return i;
  }
  return -1;
}

export function formatDate(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function calcTotalMinutes(classes) {
  return classes.reduce((sum, cls) => {
    return sum + (cls.endHour * 60 + cls.endMin) - (cls.startHour * 60 + cls.startMin);
  }, 0);
}

export function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

