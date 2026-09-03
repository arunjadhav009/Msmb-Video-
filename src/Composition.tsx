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

  const records = data?.records || [];

  // १. टॉप ५ सर्वाधिक भाव (Max Price नुसार High to Low)
  const topPrices = [...records]
    .sort((a, b) => {
      const pA = parseFloat(String(a.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      const pB = parseFloat(String(b.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      return pB - pA;
    })
    .slice(0, 5);

  // २. सर्वाधिक आवक (Quantity नुसार High to Low)
  const topArrivals = [...records]
    .sort((a, b) => {
      const qA = parseFloat(String(a.quantity).replace(/[^0-9.-]+/g, "")) || 0;
      const qB = parseFloat(String(b.quantity).replace(/[^0-9.-]+/g, "")) || 0;
      return qB - qA;
    })
    .slice(0, 5);

  // एकूण आवक आणि सरासरी भाव कॅल्क्युलेट करणे
  const totalQty = records.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const avgStatePrice = records.length
    ? Math.round(records.reduce((acc, curr) => acc + (parseFloat(curr.avg_price) || 0), 0) / records.length)
    : 0;

  // टाइमलाइन फ्रेम्स (३० fps नुसार):
  // ० ते ९० (०-३ सेकंद): इंट्रो
  // ९० ते ३९० (३-१३ सेकंद): टॉप ५ सर्वाधिक भाव
  // ३९० ते ६९० (१३-२३ सेकंद): सर्वाधिक आवक मंडई
  // ६९० ते ८४० (२३-२८ सेकंद): आउट्रो

  const isIntro = frame < 90;
  const isTopPrice = frame >= 90 && frame < 390;
  const isTopArrival = frame >= 390 && frame < 690;
  const isOutro = frame >= 690;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#090d16",
        fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at top, #7f1d1d 0%, #090d16 80%)",
        }}
      />

      {/* Main Top Header */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 40,
          right: 40,
          backgroundColor: "#b91c1c",
          padding: "24px 30px",
          borderRadius: 24,
          boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
          textAlign: "center",
          border: "2px solid rgba(255,255,255,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 46, color: "#ffffff", fontWeight: 900, letterSpacing: "1px" }}>
          🧅 महाराष्ट्र राज्य - कांदा बाजार भाव 🧅
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 15,
            fontSize: 28,
            color: "#fef08a",
            fontWeight: 700,
          }}
        >
          <span>📅 दिनांक: {data.date}</span>
          <span>📍 {data.state}</span>
        </div>
      </div>

      {/* १. इंट्रो कार्ड (० ते ३ सेकंद) */}
      {isIntro && (
        <div
          style={{
            position: "absolute",
            top: 280,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              padding: "45px 30px",
              borderRadius: 25,
              textAlign: "center",
              border: "2px solid #38bdf8",
              boxShadow: "0 10px 30px rgba(56, 189, 248, 0.2)",
            }}
          >
            <div style={{ fontSize: 32, color: "#94a3b8", fontWeight: 600 }}>आजची एकूण नोंद झालेली आवक</div>
            <div style={{ fontSize: 72, color: "#38bdf8", fontWeight: 900, marginTop: 15 }}>
              {totalQty.toLocaleString("en-IN")} <span style={{ fontSize: 34 }}>क्विंटल</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              padding: "45px 30px",
              borderRadius: 25,
              textAlign: "center",
              border: "2px solid #4ade80",
              boxShadow: "0 10px 30px rgba(74, 222, 128, 0.2)",
            }}
          >
            <div style={{ fontSize: 32, color: "#94a3b8", fontWeight: 600 }}>राज्याचा सरासरी मॉडेल भाव</div>
            <div style={{ fontSize: 72, color: "#4ade80", fontWeight: 900, marginTop: 15 }}>
              ₹{avgStatePrice} <span style={{ fontSize: 34 }}>/ क्विंटल</span>
            </div>
          </div>
        </div>
      )}

      {/* २. टॉप ५ सर्वाधिक भाव (३ ते १३ सेकंद) */}
      {isTopPrice && (
        <div style={{ position: "absolute", top: 230, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: "#f59e0b",
              color: "#000",
              padding: "16px 20px",
              borderRadius: 18,
              fontSize: 32,
              fontWeight: 900,
              textAlign: "center",
              marginBottom: 25,
              boxShadow: "0 8px 25px rgba(245, 158, 11, 0.4)",
            }}
          >
            🏆 आजचे टॉप ५ सर्वाधिक भाव (कमाल दर)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {topPrices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "24px 30px",
                  borderRadius: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: idx === 0 ? "3px solid #eab308" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 50,
                      backgroundColor: idx === 0 ? "#eab308" : "#334155",
                      color: idx === 0 ? "#000" : "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 30,
                      fontWeight: 900,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 800 }}>{item.market}</div>
                    <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 4 }}>
                      आवक: {item.quantity} क्विंटल | सरासरी: ₹{item.avg_price}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 44, color: "#4ade80", fontWeight: 900 }}>₹{item.max_price}</div>
                  <div style={{ fontSize: 20, color: "#cbd5e1" }}>कमाल भाव</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ३. सर्वाधिक आवक असलेल्या टॉप ५ मंडया (१३ ते २३ सेकंद) */}
      {isTopArrival && (
        <div style={{ position: "absolute", top: 230, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: "#0284c7",
              color: "#fff",
              padding: "16px 20px",
              borderRadius: 18,
              fontSize: 32,
              fontWeight: 900,
              textAlign: "center",
              marginBottom: 25,
              boxShadow: "0 8px 25px rgba(2, 132, 199, 0.4)",
            }}
          >
            🚜 सर्वाधिक आवक असणाऱ्या टॉप ५ मंडई
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {topArrivals.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "24px 30px",
                  borderRadius: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 50,
                      backgroundColor: "#0369a1",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 30,
                      fontWeight: 900,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 800 }}>{item.market}</div>
                    <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 4 }}>
                      दर: ₹{item.min_price} - ₹{item.max_price}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 42, color: "#38bdf8", fontWeight: 900 }}>{item.quantity}</div>
                  <div style={{ fontSize: 20, color: "#cbd5e1" }}>क्विंटल आवक</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ४. आउट्रो स्क्रीन (२३ ते २८ सेकंद) */}
      {isOutro && (
        <AbsoluteFill
          style={{
            backgroundColor: "rgba(9, 13, 22, 0.97)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
            textAlign: "center",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 110 }}>📢</div>
          <h2 style={{ fontSize: 52, color: "#ffffff", marginTop: 30, lineHeight: 1.4, fontWeight: 900 }}>
            दररोजच्या ताज्या बाजारभावासाठी आपल्या पेजला आत्ताच{" "}
            <span style={{ color: "#facc15" }}>फॉलो करा!</span>
          </h2>
          <div
            style={{
              marginTop: 45,
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              padding: "22px 60px",
              borderRadius: 60,
              fontSize: 36,
              fontWeight: "bold",
              boxShadow: "0 15px 35px rgba(185, 28, 28, 0.7)",
            }}
          >
            🔔 Follow & Share
          </div>
        </AbsoluteFill>
      )}

      {/* Bottom Footer */}
      {!isOutro && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            right: 40,
            backgroundColor: "#1e293b",
            padding: "18px 30px",
            borderRadius: 20,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#94a3b8",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span>⚖️ दर प्रति क्विंटल (₹)</span>
          <span style={{ color: "#facc15", fontWeight: 700 }}>दररोजच्या ताज्या भावासाठी फॉलो करा</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
