# Master Calendar

A personal university semester calendar built with React and Vite. Designed for quick, at-a-glance access to the weekly class schedule — with day and week views, live "next up" tracking, and weekly stats.

## Features

- **Day & Week Views** — Toggle between a detailed day timeline and a full week overview
- **Week Navigation** — Browse semester weeks (2–18) with a "Today" shortcut to jump back
- **Live Class Tracking** — Highlights the current or next upcoming class in real time
- **Daily Timeline** — Visual hour-by-hour layout of each day's classes with color-coded blocks
- **Weekly Stats** — At a glance: classes today, total weekly hours, and free days
- **Motivational Quotes** — Rotating quote card with a refresh button
- **Sticker Buddy** — Animated companion that appears on days with classes
- **Responsive** — Mobile-friendly layout with adaptive sticker positioning

## Tech Stack

| Layer      | Tool                  |
| ---------- | --------------------- |
| Framework  | React 18              |
| Bundler    | Vite 5                |
| Styling    | Inline styles + CSS-in-JS animations |
| Fonts      | DM Sans, Space Mono (Google Fonts) |
| Analytics  | Plausible             |
| Hosting    | Netlify               |

## Project Structure

```
src/
├── main.jsx                  # App entry point
├── week2-calendar.jsx        # Root calendar component
├── assets/
│   ├── classes.json          # Semester data (courses, schedule, dates)
│   ├── uni-logo.png          # University logo
│   └── sticker.jpg           # Sticker buddy image
├── components/
│   ├── DayTimeline.jsx       # Hour-by-hour day view
│   ├── WeekPreview.jsx       # Compact week overview
│   ├── QuoteCard.jsx         # Motivational quote card
│   └── StickerBuddy.jsx      # Animated sticker companion
└── utils/
    ├── constants.js          # Colors, day names, quotes
    └── schedule.js           # Week calculation & class filtering
```

## Getting Started

### Prerequisites

- Node.js 18+

### Install & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

The production build outputs to `dist/`.

## Customization

All semester data lives in `src/assets/classes.json`. To adapt the calendar for a different semester or set of courses, edit:

- **`courses`** — Add or remove courses with name, instructor, location, icon, and color
- **`schedule`** — Define which days/times each course meets and the active week range
- **`semesterStartDate`** — The Monday of week 1
- **`weeksRange`** — First and last active weeks of the semester

## Deployment

The project includes a `netlify.toml` configured for automatic builds:

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **SPA routing:** All paths redirect to `index.html`

## License

This is a personal project. Feel free to fork and adapt for your own schedule.
