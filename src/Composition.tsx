import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

export interface MarketRecord {
  market: string;
  variety: string;
  quantity: string;
  min_price: string;
  max_price: string;
  avg_price: string;
}

export interface VideoData {
  date: string;
  state: string;
  records: MarketRecord[];
}

export const OnionRateVideo: React.FC<{ data: VideoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Intro Spring Animation (0 to 60 frames)
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const recordCount = data.records?.length || 1;
  const totalContentHeight = recordCount * 75;

  // 2. Smooth Auto-Scroll Animation (Frame 60 to 580)
  const scrollY = interpolate(
    frame,
    [60, 580],
    [0, Math.min(0, -(totalContentHeight - 1200))],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3. Outro Card Opacity (Frame 580 to 610)
  const outroOpacity = interpolate(frame, [580, 610], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at top, #881337 0%, #0f172a 75%)",
        }}
      />

      {/* Top Header */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 36,
          right: 36,
          backgroundColor: "#b91c1c",
          padding: "24px 28px",
          borderRadius: 24,
          boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
          zIndex: 10,
          textAlign: "center",
          transform: `scale(${introProgress})`,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 46, color: "#ffffff", fontWeight: 800 }}>
          🧅 महाराष्ट्र राज्य - आजचे कांदा बाजार भाव 🧅
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            fontSize: 26,
            color: "#fef08a",
            fontWeight: 600,
          }}
        >
          <span>📅 तारीख: {data.date}</span>
          <span>📍 राज्य: {data.state}</span>
        </div>
      </div>

      {/* Column Headers */}
      <div
        style={{
          position: "absolute",
          top: 215,
          left: 36,
          right: 36,
          display: "flex",
          backgroundColor: "#1e293b",
          padding: "18px 16px",
          borderRadius: "16px 16px 0 0",
          fontWeight: "bold",
          fontSize: 24,
          color: "#94a3b8",
          zIndex: 5,
        }}
      >
        <div style={{ flex: 2.2 }}>बाजार समिती</div>
        <div style={{ flex: 1.5, textAlign: "center" }}>आवक (क्विं.)</div>
        <div style={{ flex: 1.5, textAlign: "center" }}>कमी भाव</div>
        <div style={{ flex: 1.5, textAlign: "center" }}>जास्त भाव</div>
        <div style={{ flex: 1.5, textAlign: "center", color: "#4ade80" }}>सरासरी</div>
      </div>

      {/* Middle Scrolling List */}
      <div
        style={{
          position: "absolute",
          top: 285,
          left: 36,
          right: 36,
          height: 1450,
          overflow: "hidden",
        }}
      >
        <div style={{ transform: `translateY(${scrollY}px)` }}>
          {data.records?.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 16px",
                backgroundColor:
                  index % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              <div style={{ flex: 2.2, color: "#ffffff" }}>
                {item.market}
                <span style={{ fontSize: 18, color: "#94a3b8", display: "block", marginTop: 4 }}>
                  {item.variety}
                </span>
              </div>
              <div style={{ flex: 1.5, textAlign: "center", color: "#cbd5e1" }}>{item.quantity}</div>
              <div style={{ flex: 1.5, textAlign: "center", color: "#f87171" }}>₹{item.min_price}</div>
              <div style={{ flex: 1.5, textAlign: "center", color: "#38bdf8" }}>₹{item.max_price}</div>
              <div
                style={{
                  flex: 1.5,
                  textAlign: "center",
                  color: "#4ade80",
                  fontWeight: 800,
                  fontSize: 28,
                }}
              >
                ₹{item.avg_price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 35,
          left: 36,
          right: 36,
          backgroundColor: "#1e293b",
          padding: "16px 24px",
          borderRadius: 16,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          color: "#94a3b8",
        }}
      >
        <span>⚖️ दर प्रति क्विंटल (₹)</span>
        <span style={{ color: "#facc15" }}>दररोजच्या ताज्या बाजारभावासाठी फॉलो करा</span>
      </div>

      {/* Outro Screen (Last 3 seconds) */}
      {frame >= 580 && (
        <AbsoluteFill
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.96)",
            opacity: outroOpacity,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
            textAlign: "center",
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 90 }}>📢</div>
          <h2 style={{ fontSize: 50, color: "#ffffff", marginTop: 24, lineHeight: 1.4 }}>
            दररोजच्या ताज्या बाजारभावासाठी आपल्या पेजला आत्ताच{" "}
            <span style={{ color: "#facc15" }}>फॉलो करा!</span>
          </h2>
          <div
            style={{
              marginTop: 40,
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              padding: "20px 50px",
              borderRadius: 50,
              fontSize: 34,
              fontWeight: "bold",
              boxShadow: "0 12px 30px rgba(185, 28, 28, 0.6)",
            }}
          >
            🔔 Follow & Share
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
