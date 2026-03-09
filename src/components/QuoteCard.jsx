import React, { useState, useEffect } from "react";
import { QUOTES, PRIMARY, PRIMARY_LIGHT, PRIMARY_SOFT } from "../utils/constants";

export default function QuoteCard() {
  const [quote, setQuote] = useState(null);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const refresh = () => {
    setFade(false);
    setTimeout(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setFade(true);
    }, 200);
  };

  if (!quote) return null;

  return (
    <div className="hover-glow" style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 14,
      padding: "12px 18px",
      marginBottom: 14,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      gap: 12,
      animation: "slideInRight 0.4s ease 0.05s both",
      transition: "all 0.2s ease",
    }}>
      <div style={{
        fontSize: 28, lineHeight: 1, color: PRIMARY, opacity: 0.25,
        fontFamily: "Georgia, 'Times New Roman', serif",
        userSelect: "none", flexShrink: 0,
      }}>❝</div>
      <div style={{
        flex: 1, minWidth: 0,
        opacity: fade ? 1 : 0, transition: "opacity 0.25s ease",
      }}>
        <p style={{
          fontSize: 12, fontWeight: 500, color: "#334155",
          margin: 0, lineHeight: 1.5, fontStyle: "italic",
        }}>{quote.text}</p>
        <div style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, marginTop: 4 }}>
          — {quote.author}
        </div>
      </div>
      <button onClick={(e) => { e.currentTarget.style.transform = "rotate(360deg)"; refresh(); setTimeout(() => { if (e.currentTarget) e.currentTarget.style.transform = "rotate(0deg)"; }, 400); }} style={{
        background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 7,
        width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: "#94A3B8", cursor: "pointer",
        transition: "all 0.3s ease",
        flexShrink: 0,
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = PRIMARY_LIGHT; e.currentTarget.style.color = PRIMARY; e.currentTarget.style.borderColor = PRIMARY_SOFT; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
      >↻</button>
    </div>
  );
}
