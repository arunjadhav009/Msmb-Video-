import { AbsoluteFill, useCurrentFrame } from "remotion";
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

  // १. टॉप ५ कमाल भाव (Max Price नुसार High to Low)
  const topPrices = [...records]
    .sort((a, b) => {
      const pA = parseFloat(String(a.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      const pB = parseFloat(String(b.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      return pB - pA;
    })
    .slice(0, 5);

  // २. संपूर्ण डेटा आवक (Quantity) नुसार उतरत्या क्रमाने (High to Low) सॉर्ट करणे
  const sortedByQuantity = [...records].sort((a, b) => {
    const qA = parseFloat(String(a.quantity).replace(/[^0-9.-]+/g, "")) || 0;
    const qB = parseFloat(String(b.quantity).replace(/[^0-9.-]+/g, "")) || 0;
    return qB - qA;
  });

  // टॉप ५ आवक (डॅशबोर्डसाठी)
  const topArrivals = sortedByQuantity.slice(0, 5);

  const totalQty = records.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const avgStatePrice = records.length
    ? Math.round(records.reduce((acc, curr) => acc + (parseFloat(curr.avg_price) || 0), 0) / records.length)
    : 0;

  // ३. आवक हाय-टू-लो नुसार १४ - १४ चे ४ लॉट्स
  const slide1 = sortedByQuantity.slice(0, 14);
  const slide2 = sortedByQuantity.slice(14, 28);
  const slide3 = sortedByQuantity.slice(28, 42);
  const slide4 = sortedByQuantity.slice(42, 56);

  // ४० सेकंदांची टाइमलाइन (३० FPS = १२०० फ्रेम्स):
  // ० ते ९० (०-३ से): इंट्रो
  // ९० ते २७० (३-९ से): टॉप ५ भाव + टॉप ५ आवक
  // २७० ते ४८० (९-१६ से): स्लाईड १ (१ ते १४ - सर्वाधिक आवक)
  // ४८० ते ६९० (१६-२३ से): स्लाईड २ (१५ ते २८)
  // ६९० ते ९०० (२३-३० से): स्लाईड ३ (२९ ते ४२)
  // ९०० ते १११० (३०-३७ से): स्लाईड ४ (४३ ते ५६ - सर्वात कमी आवक)
  // १११० ते १२०० (३७-४० से): आउट्रो

  const isIntro = frame < 90;
  const isDashboard = frame >= 90 && frame < 270;
  const isSlide1 = frame >= 270 && frame < 480;
  const isSlide2 = frame >= 480 && frame < 690;
  const isSlide3 = frame >= 690 && frame < 900;
  const isSlide4 = frame >= 900 && frame < 1110;
  const isOutro = frame >= 1110;

  let currentSlideData: MarketRecord[] = [];
  let slideTitle = "";
  if (isSlide1) { currentSlideData = slide1; slideTitle = "मार्केट भाव (आवक रँक: १ ते १४)"; }
  else if (isSlide2) { currentSlideData = slide2; slideTitle = "मार्केट भाव (आवक रँक: १५ ते २८)"; }
  else if (isSlide3) { currentSlideData = slide3; slideTitle = "मार्केट भाव (आवक रँक: २९ ते ४२)"; }
  else if (isSlide4) { currentSlideData = slide4; slideTitle = "मार्केट भाव (आवक रँक: ४३ ते ५६)"; }

  const isTableSlide = isSlide1 || isSlide2 || isSlide3 || isSlide4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070b14",
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
          background: "radial-gradient(circle at 50% 15%, #581010 0%, #070b14 70%)",
        }}
      />

      {/* १. हेडर (Top Fixed Header) */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: 30,
          right: 30,
          backgroundColor: "#b91c1c",
          padding: "16px 24px",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          textAlign: "center",
          border: "2px solid rgba(255,255,255,0.15)",
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 42, color: "#ffffff", fontWeight: 900 }}>
          🧅 महाराष्ट्र राज्य - कांदा बाजार भाव 🧅
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 24,
            color: "#fef08a",
            fontWeight: 700,
          }}
        >
          <span>📅 तारीख: {data.date}</span>
          <span>📍 राज्य: {data.state}</span>
        </div>
      </div>

      {/* २. इंट्रो ओव्हरव्ह्यू (० ते ३ सेकंद) */}
      {isIntro && (
        <div
          style={{
            position: "absolute",
            top: 250,
            left: 35,
            right: 35,
            display: "flex",
            flexDirection: "column",
            gap: 45,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.95)",
              padding: "70px 30px",
              borderRadius: 28,
              textAlign: "center",
              border: "3px solid #38bdf8",
              boxShadow: "0 15px 40px rgba(56, 189, 248, 0.25)",
            }}
          >
            <div style={{ fontSize: 36, color: "#94a3b8", fontWeight: 700 }}>आजची एकूण नोंद झालेली आवक</div>
            <div style={{ fontSize: 88, color: "#38bdf8", fontWeight: 900, marginTop: 20 }}>
              {totalQty.toLocaleString("en-IN")} <span style={{ fontSize: 42 }}>क्विंटल</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.95)",
              padding: "70px 30px",
              borderRadius: 28,
              textAlign: "center",
              border: "3px solid #4ade80",
              boxShadow: "0 15px 40px rgba(74, 222, 128, 0.25)",
            }}
          >
            <div style={{ fontSize: 36, color: "#94a3b8", fontWeight: 700 }}>राज्याचा सरासरी मॉडेल भाव</div>
            <div style={{ fontSize: 88, color: "#4ade80", fontWeight: 900, marginTop: 20 }}>
              ₹{avgStatePrice} <span style={{ fontSize: 42 }}>/ क्विंटल</span>
            </div>
          </div>
        </div>
      )}

      {/* ३. डॅशबोर्ड (३ ते ९ सेकंद) - नो गॅप (मोठे कार्ड्स) */}
      {isDashboard && (
        <div style={{ position: "absolute", top: 180, left: 30, right: 30 }}>
          {/* Top 5 Prices */}
          <div
            style={{
              backgroundColor: "#d97706",
              color: "#fff",
              padding: "14px 20px",
              borderRadius: 14,
              fontSize: 26,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            🏆 आजचे टॉप ५ सर्वाधिक भाव (कमाल दर)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {topPrices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "16px 24px",
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "8px solid #f59e0b",
                }}
              >
                <div style={{ fontSize: 27, fontWeight: 800 }}>
                  <span style={{ color: "#f59e0b", marginRight: 14 }}>#{idx + 1}</span>
                  {item.market} <span style={{ fontSize: 20, color: "#94a3b8" }}>({item.variety})</span>
                </div>
                <div style={{ fontSize: 34, color: "#4ade80", fontWeight: 900 }}>₹{item.max_price}</div>
              </div>
            ))}
          </div>

          {/* Top 5 Arrivals */}
          <div
            style={{
              backgroundColor: "#0284c7",
              color: "#fff",
              padding: "14px 20px",
              borderRadius: 14,
              fontSize: 26,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            🚜 सर्वाधिक आवक असणारे टॉप ५ मार्केट
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topArrivals.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "16px 24px",
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "8px solid #0284c7",
                }}
              >
                <div style={{ fontSize: 27, fontWeight: 800 }}>
                  <span style={{ color: "#38bdf8", marginRight: 14 }}>#{idx + 1}</span>
                  {item.market} <span style={{ fontSize: 20, color: "#94a3b8" }}>(दर: ₹{item.avg_price})</span>
                </div>
                <div style={{ fontSize: 34, color: "#38bdf8", fontWeight: 900 }}>{item.quantity} क्विं.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ४. टेबल स्लाईड्स (आवक High to Low नुसार क्रमवारी - No Gap) */}
      {isTableSlide && (
        <div style={{ position: "absolute", top: 175, left: 24, right: 24 }}>
          {/* Table Header Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              padding: "0 8px",
            }}
          >
            <span style={{ fontSize: 26, color: "#fef08a", fontWeight: 800 }}>📌 {slideTitle}</span>
            <span style={{ fontSize: 22, color: "#94a3b8" }}>दर प्रति क्विंटल (₹)</span>
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "#1e293b",
              padding: "14px 16px",
              borderRadius: "14px 14px 0 0",
              fontWeight: 800,
              fontSize: 23,
              color: "#cbd5e1",
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

          {/* १४ Rows Container - भरलेला आणि उंच लेआउट */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              borderRadius: "0 0 14px 14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {currentSlideData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  height: "66px",
                  boxSizing: "border-box",
                  backgroundColor: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                <div style={{ flex: 2.3, color: "#ffffff", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.market}
                </div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#94a3b8", fontSize: 20 }}>
                  {item.variety || "लोकल"}
                </div>
                <div style={{ flex: 1.3, textAlign: "center", color: "#38bdf8", fontWeight: 900 }}>
                  {item.quantity}
                </div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#f87171" }}>₹{item.min_price}</div>
                <div style={{ flex: 1.1, textAlign: "center", color: "#38bdf8" }}>₹{item.max_price}</div>
                <div style={{ flex: 1.4, textAlign: "center", color: "#4ade80", fontWeight: 900, fontSize: 27 }}>
                  ₹{item.avg_price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ५. तळभागातील कायमस्वरूपी सुरक्षित जाहिरात बॅनर (YouTube/Reels Safe Zone) */}
      {!isOutro && (
        <div
          style={{
            position: "absolute",
            bottom: 35,
            left: 24,
            right: 24,
            height: "360px",
            backgroundColor: "rgba(15, 23, 42, 0.96)",
            borderRadius: 24,
            border: "3px dashed #eab308",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px 30px",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.7)",
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, color: "#fef08a", marginBottom: 12 }}>
            📢 दररोजचे ताजे कांदा बाजार भाव
          </div>
          <div style={{ fontSize: 26, color: "#ffffff", fontWeight: 700, lineHeight: 1.4 }}>
            दररोजच्या अचूक बाजारभावाच्या अपडेटसाठी आपल्या चॅनलला आत्ताच
          </div>
          <div
            style={{
              marginTop: 22,
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              padding: "16px 50px",
              borderRadius: 50,
              fontSize: 32,
              fontWeight: 900,
              boxShadow: "0 8px 25px rgba(185, 28, 28, 0.7)",
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

      {/* ६. आउट्रो स्क्रीन (३७ ते ४० सेकंद) */}
      {isOutro && (
        <AbsoluteFill
          style={{
            backgroundColor: "rgba(7, 11, 20, 0.98)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
            textAlign: "center",
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 110 }}>🧅</div>
          <h2 style={{ fontSize: 52, color: "#ffffff", marginTop: 25, lineHeight: 1.4, fontWeight: 900 }}>
            दररोजच्या ताज्या बाजारभावासाठी आपल्या पेजला आत्ताच <span style={{ color: "#facc15" }}>फॉलो आणि सबस्क्राईब करा!</span>
          </h2>
          <div
            style={{
              marginTop: 40,
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              padding: "20px 65px",
              borderRadius: 60,
              fontSize: 36,
              fontWeight: "bold",
              boxShadow: "0 15px 35px rgba(185, 28, 28, 0.7)",
            }}
          >
            🔔 Like, Share & Subscribe
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
