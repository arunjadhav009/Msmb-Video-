import { AbsoluteFill, useCurrentFrame, Audio, staticFile } from "remotion";
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

  const records = data?.records || [];

  // १. टॉप ५ कमाल भाव
  const topPrices = [...records]
    .sort((a, b) => {
      const pA = parseFloat(String(a.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      const pB = parseFloat(String(b.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      return pB - pA;
    })
    .slice(0, 5);

  // २. संपूर्ण डेटा आवक (Quantity) High to Low नुसार
  const sortedByQuantity = [...records].sort((a, b) => {
    const qA = parseFloat(String(a.quantity).replace(/[^0-9.-]+/g, "")) || 0;
    const qB = parseFloat(String(b.quantity).replace(/[^0-9.-]+/g, "")) || 0;
    return qB - qA;
  });

  const topArrivals = sortedByQuantity.slice(0, 5);

  const totalQty = records.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const avgStatePrice = records.length
    ? Math.round(records.reduce((acc, curr) => acc + (parseFloat(curr.avg_price) || 0), 0) / records.length)
    : 0;

  // ३. डायनॅमिक चंक्स (१४-१४ च्या स्लाईड्स)
  const chunkSize = 14;
  const slides: MarketRecord[][] = [];
  for (let i = 0; i < sortedByQuantity.length && slides.length < 4; i += chunkSize) {
    slides.push(sortedByQuantity.slice(i, i + chunkSize));
  }
  const totalSlides = Math.max(1, slides.length);

  // ४. टाइमलाइन (४० सेकंद = १२०० फ्रेम्स)
  const isIntro = frame < 90;
  const isDashboard = frame >= 90 && frame < 270;
  const isOutro = frame >= 1110;
  const isTablePhase = frame >= 270 && frame < 1110;

  let currentSlideIndex = 0;
  let currentSlideData: MarketRecord[] = [];
  let slideTitle = "";

  if (isTablePhase) {
    const tableFrames = frame - 270;
    const framesPerSlide = 840 / totalSlides;
    currentSlideIndex = Math.min(Math.floor(tableFrames / framesPerSlide), totalSlides - 1);
    currentSlideData = slides[currentSlideIndex] || [];

    const startRank = currentSlideIndex * chunkSize + 1;
    const endRank = startRank + currentSlideData.length - 1;
    slideTitle = `मार्केट भाव (आवक रँक: ${startRank} ते ${endRank})`;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060913",
        fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* पार्श्वभूमी */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 50% 12%, #831843 0%, #1e1b4b 40%, #030712 90%)",
        }}
      />

      {/* हेडर बार */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 24,
          right: 24,
          background: "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)",
          padding: "16px 28px",
          borderRadius: 22,
          boxShadow: "0 14px 35px rgba(220, 38, 38, 0.4)",
          textAlign: "center",
          border: "2px solid rgba(255,255,255,0.3)",
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 43, color: "#ffffff", fontWeight: 900 }}>
          🧅 महाराष्ट्र राज्य - कांदा बाजार भाव 🧅
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 26,
            color: "#fef08a",
            fontWeight: 800,
          }}
        >
          <span>📅 तारीख: {data.date}</span>
          <span>📍 राज्य: {data.state}</span>
        </div>
      </div>

      {/* इंट्रो ओव्हरव्ह्यू */}
      {isIntro && (
        <div
          style={{
            position: "absolute",
            top: 200,
            bottom: 450,
            left: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.85) 100%)",
              padding: "60px 30px",
              borderRadius: 30,
              textAlign: "center",
              border: "3px solid #38bdf8",
              boxShadow: "0 20px 50px rgba(56, 189, 248, 0.3)",
            }}
          >
            <div style={{ fontSize: 50, marginBottom: 10 }}>🏬</div>
            <div style={{ fontSize: 36, color: "#cbd5e1", fontWeight: 800 }}>आजची एकूण नोंद झालेली आवक</div>
            <div style={{ fontSize: 92, color: "#38bdf8", fontWeight: 900, marginTop: 15 }}>
              {totalQty.toLocaleString("en-IN")} <span style={{ fontSize: 44, color: "#fff" }}>क्विंटल</span>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.85) 100%)",
              padding: "60px 30px",
              borderRadius: 30,
              textAlign: "center",
              border: "3px solid #22c55e",
              boxShadow: "0 20px 50px rgba(34, 197, 94, 0.3)",
            }}
          >
            <div style={{ fontSize: 50, marginBottom: 10 }}>💰</div>
            <div style={{ fontSize: 36, color: "#cbd5e1", fontWeight: 800 }}>राज्याचा सरासरी मॉडेल भाव</div>
            <div style={{ fontSize: 92, color: "#22c55e", fontWeight: 900, marginTop: 15 }}>
              ₹{avgStatePrice} <span style={{ fontSize: 44, color: "#fff" }}>/ क्विंटल</span>
            </div>
          </div>
        </div>
      )}

      {/* डॅशबोर्ड (Top 5 Rates + Top 5 Arrivals) */}
      {isDashboard && (
        <div
          style={{
            position: "absolute",
            top: 175,
            bottom: 435,
            left: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 16 }}>
            <div
              style={{
                background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                color: "#000",
                padding: "14px 20px",
                borderRadius: 16,
                fontSize: 27,
                fontWeight: 900,
                textAlign: "center",
              }}
            >
              🏆 आजचे टॉप ५ सर्वाधिक भाव (कमाल दर)
            </div>
            {topPrices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  margin: "4px 0",
                  background: "linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
                  padding: "0 24px",
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1.5px solid rgba(245, 158, 11, 0.4)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #fde047 0%, #ca8a04 100%)",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 29, fontWeight: 800 }}>
                    {item.market} <span style={{ fontSize: 22, color: "#94a3b8" }}>({item.variety})</span>
                  </div>
                </div>
                <div style={{ fontSize: 38, color: "#4ade80", fontWeight: 900 }}>₹{item.max_price}</div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div
              style={{
                background: "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)",
                color: "#fff",
                padding: "14px 20px",
                borderRadius: 16,
                fontSize: 27,
                fontWeight: 900,
                textAlign: "center",
              }}
            >
              🚜 सर्वाधिक आवक असणारे टॉप ५ मार्केट
            </div>
            {topArrivals.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  margin: "4px 0",
                  background: "linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
                  padding: "0 24px",
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1.5px solid rgba(56, 189, 248, 0.35)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #38bdf8 0%, #0284c7 100%)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 29, fontWeight: 800 }}>
                    {item.market} <span style={{ fontSize: 21, color: "#94a3b8" }}>(दर: ₹{item.avg_price})</span>
                  </div>
                </div>
                <div style={{ fontSize: 36, color: "#38bdf8", fontWeight: 900 }}>{item.quantity} क्विं.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* टेबल स्लाईड्स */}
      {isTablePhase && (
        <div style={{ position: "absolute", top: 175, left: 24, right: 24, bottom: 435, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              padding: "0 8px",
            }}
          >
            <span style={{ fontSize: 26, color: "#fde047", fontWeight: 900 }}>📌 {slideTitle}</span>
            <span style={{ fontSize: 22, color: "#cbd5e1", fontWeight: 700 }}>दर प्रति क्विंटल (₹)</span>
          </div>

          <div
            style={{
              display: "flex",
              background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              padding: "14px 16px",
              borderRadius: "16px 16px 0 0",
              fontWeight: 800,
              fontSize: 24,
              color: "#e2e8f0",
              borderBottom: "3px solid #334155",
            }}
          >
            <div style={{ flex: 2.3 }}>मार्केट</div>
            <div style={{ flex: 1.1, textAlign: "center" }}>जात</div>
            <div style={{ flex: 1.3, textAlign: "center", color: "#38bdf8" }}>आवक(क्विं.) ↓</div>
            <div style={{ flex: 1.1, textAlign: "center" }}>कमी</div>
            <div style={{ flex: 1.1, textAlign: "center" }}>जास्त</div>
            <div style={{ flex: 1.4, textAlign: "center", color: "#4ade80" }}>सरासरी</div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden",
              border: "1.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {currentSlideData.map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  boxSizing: "border-box",
                  backgroundColor: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontSize: currentSlideData.length > 10 ? 25 : 28,
                  fontWeight: 700,
                }}
              >
                <div style={{ flex: 2.3, color: "#ffffff", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.market}
                </div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#94a3b8", fontSize: currentSlideData.length > 10 ? 21 : 24 }}>
                  {item.variety || "लोकल"}
                </div>
                <div style={{ flex: 1.3, textAlign: "center", color: "#38bdf8", fontWeight: 900 }}>
                  {item.quantity}
                </div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#f87171" }}>₹{item.min_price}</div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#38bdf8" }}>₹{item.max_price}</div>
                <div style={{ flex: 1.4, textAlign: "center", color: "#4ade80", fontWeight: 900, fontSize: currentSlideData.length > 10 ? 28 : 32 }}>
                  ₹{item.avg_price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* सुरक्षित जाहिरात बॅनर */}
      {!isOutro && (
        <div
          style={{
            position: "absolute",
            bottom: 25,
            left: 24,
            right: 24,
            height: "395px",
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(8, 13, 26, 0.99) 100%)",
            borderRadius: 26,
            border: "3px dashed #eab308",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px 30px",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 900, color: "#fde047", marginBottom: 14 }}>
            📢 दररोजचे ताजे कांदा बाजार भाव
          </div>
          <div style={{ fontSize: 28, color: "#ffffff", fontWeight: 700, lineHeight: 1.4 }}>
            दररोजच्या अचूक बाजारभावाच्या अपडेटसाठी आपल्या चॅनलला आत्ताच
          </div>
          <div
            style={{
              marginTop: 24,
              background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
              color: "#ffffff",
              padding: "16px 55px",
              borderRadius: 50,
              fontSize: 34,
              fontWeight: 900,
              boxShadow: "0 10px 30px rgba(220, 38, 38, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <span>👍 Like</span>
            <span>•</span>
            <span>🔔 Subscribe</span>
            <span>•</span>
            <span>✨ Follow</span>
          </div>
        </div>
      )}

      {/* अंतिम आउट्रो */}
      {isOutro && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 50% 30%, #831843 0%, #090d16 85%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
            textAlign: "center",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 130 }}>🧅</div>
          <h2 style={{ fontSize: 52, color: "#ffffff", marginTop: 25, lineHeight: 1.4, fontWeight: 900 }}>
            दररोजच्या ताज्या बाजारभावासाठी आपल्या पेजला आत्ताच <span style={{ color: "#facc15" }}>फॉलो आणि सबस्क्राईब करा!</span>
          </h2>
          <div
            style={{
              marginTop: 40,
              background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
              color: "#ffffff",
              padding: "22px 70px",
              borderRadius: 60,
              fontSize: 36,
              fontWeight: "bold",
              boxShadow: "0 18px 40px rgba(220, 38, 38, 0.7)",
            }}
          >
            🔔 Like, Share & Subscribe
          </div>
        </AbsoluteFill>
      )}

      {/* कॉपीराइट-फ्री बॅकग्राउंड म्युझिक जोडले आहे */}
      <Audio
        src={staticFile("bg-music.mp3")}
        volume={(f) => (f > 1140 ? ((1200 - f) / 60) * 0.15 : 0.15)}
      />
    </AbsoluteFill>
  );
};
