import React, { useState, useEffect, useRef } from "react";
import stickerImg from "../assets/sticker.jpg";
import { PRIMARY } from "../utils/constants";

export default function StickerBuddy({ hasClasses }) {
  const [visible, setVisible] = useState(hasClasses);
  const [animState, setAnimState] = useState(hasClasses ? "in" : "out");
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setVisible(hasClasses);
      setAnimState(hasClasses ? "in" : "out");
      return;
    }

    if (hasClasses) {
      setVisible(true);
      // small delay so the element mounts before animation triggers
      requestAnimationFrame(() => setAnimState("in"));
    } else {
      setAnimState("out");
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [hasClasses]);

  if (!visible) return null;

  return (
    <div className={`sticker-buddy sticker-${animState}`}>
      {/* Speech Bubble */}
      <div className={`sticker-bubble sticker-bubble-${animState}`}>
        <span style={{ fontSize: 12, color: "#64748B", lineHeight: 1.3, display: "block" }}>
          Am not there?? 
        </span>
        <strong style={{ fontSize: 13, color: PRIMARY, letterSpacing: "0.5px" }}>
          WAKE ME UP...
        </strong>
        {/* Bubble tail */}
        <div className="bubble-tail" />
      </div>

      {/* Sticker Image */}
      <div className="sticker-frame">
        <img src={stickerImg} alt="sleepy sticker" draggable={false} />
      </div>
    </div>
  );
}

