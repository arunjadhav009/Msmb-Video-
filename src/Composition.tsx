import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
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

  // १. टॉप ५ सर्वाधिक भाव (Max Price)
  const topPrices = [...records]
    .sort((a, b) => {
      const pA = parseFloat(String(a.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      const pB = parseFloat(String(b.max_price).replace(/[^0-9.-]+/g, "")) || 0;
      return pB - pA;
    })
    .slice(0, 5);

  // २. सर्वाधिक आवक (Quantity)
  const topArrivals = [...records]
    .sort((a, b) => {
      const qA = parseFloat(String(a.quantity).replace(/[^0-9.-]+/g, "")) || 0;
      const qB = parseFloat(String(b.quantity).replace(/[^0-9.-]+/g, "")) || 0;
      return qB - qA;
    })
    .slice(0, 5);

  const totalQty = records.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const avgStatePrice = records.length
    ? Math.round(records.reduce((acc, curr) => acc + (parseFloat(curr.avg_price) || 0), 0) / records.length)
    : 0;

  // १४ - १४ चे लॉट्स
  const slide1 = records.slice(0, 14);
  const slide2 = records.slice(14, 28);
  const slide3 = records.slice(28, 42);
  const slide4 = records.slice(42, 56);

  // टाइमलाइन मॅपिंग (30 FPS नुसार एकूण ५३ सेकंद = १५९० फ्रेम्स):
  // ० ते ९० (० ते ३ सेकंद): इंट्रो (एकूण आवक आणि सरासरी)
  // ९० ते ३३० (३ ते ११ सेकंद): टॉप ५ भाव + टॉप ५ आवक डॅशबोर्ड
  // ३३० ते ६०० (११ ते २० सेकंद): स्लाईड १ (१ ते १४ मार्केट)
  // ६०० ते ८७० (२० ते २९ सेकंद): स्लाईड २ (१५ ते २८ मार्केट)
  // ८७० ते ११४० (२९ ते ३८ सेकंद): स्लाईड ३ (२९ ते ४२ मार्केट)
  // ११४० ते १४१० (३८ ते ४७ सेकंद): स्लाईड ४ (४३ ते ५६ मार्केट)
  // १४१० ते १५९० (४७ ते ५३ सेकंद): आउट्रो

  const isIntro = frame < 90;
  const isDashboard = frame >= 90 && frame < 330;
  const isSlide1 = frame >= 330 && frame < 600;
  const isSlide2 = frame >= 600 && frame < 870;
  const isSlide3 = frame >= 870 && frame < 1140;
  const isSlide4 = frame >= 1140 && frame < 1410;
  const isOutro = frame >= 1410;

  // चालू स्लाईड डेटा ठरवणे
  let currentSlideData: MarketRecord[] = [];
  let slideTitle = "";
  if (isSlide1) { currentSlideData = slide1; slideTitle = "मार्केट भाव (१ ते १४)"; }
  else if (isSlide2) { currentSlideData = slide2; slideTitle = "मार्केट भाव (१५ ते २८)"; }
  else if (isSlide3) { currentSlideData = slide3; slideTitle = "मार्केट भाव (२९ ते ४२)"; }
  else if (isSlide4) { currentSlideData = slide4; slideTitle = "मार्केट भाव (४३ ते ५६)"; }

  const isTableSlide = isSlide1 || isSlide2 || isSlide3 || isSlide4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070b14",
        fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Background Subtle Gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 50% 15%, #581010 0%, #070b14 70%)",
        }}
      />

      {/* १. स्थिर टॉप हेडर (सर्व स्क्रीनवर वर दिसेल) */}
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
        <h1 style={{ margin: 0, fontSize: 40, color: "#ffffff", fontWeight: 900 }}>
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
            left: 40,
            right: 40,
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.95)",
              padding: "45px 30px",
              borderRadius: 25,
              textAlign: "center",
              border: "3px solid #38bdf8",
              boxShadow: "0 15px 35px rgba(56, 189, 248, 0.2)",
            }}
          >
            <div style={{ fontSize: 32, color: "#94a3b8", fontWeight: 700 }}>आजची एकूण नोंद झालेली आवक</div>
            <div style={{ fontSize: 75, color: "#38bdf8", fontWeight: 900, marginTop: 15 }}>
              {totalQty.toLocaleString("en-IN")} <span style={{ fontSize: 36 }}>क्विंटल</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.95)",
              padding: "45px 30px",
              borderRadius: 25,
              textAlign: "center",
              border: "3px solid #4ade80",
              boxShadow: "0 15px 35px rgba(74, 222, 128, 0.2)",
            }}
          >
            <div style={{ fontSize: 32, color: "#94a3b8", fontWeight: 700 }}>राज्याचा सरासरी मॉडेल भाव</div>
            <div style={{ fontSize: 75, color: "#4ade80", fontWeight: 900, marginTop: 15 }}>
              ₹{avgStatePrice} <span style={{ fontSize: 36 }}>/ क्विंटल</span>
            </div>
          </div>
        </div>
      )}

      {/* ३. पॉवर डॅशबोर्ड: टॉप ५ कमाल भाव + टॉप ५ आवक (३ ते ११ सेकंद) */}
      {isDashboard && (
        <div style={{ position: "absolute", top: 180, left: 30, right: 30 }}>
          {/* Top 5 Prices */}
          <div
            style={{
              backgroundColor: "#d97706",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            🏆 आजचे टॉप ५ सर्वाधिक भाव (कमाल दर)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 25 }}>
            {topPrices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "10px 20px",
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "6px solid #f59e0b",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  <span style={{ color: "#f59e0b", marginRight: 12 }}>#{idx + 1}</span>
                  {item.market} <span style={{ fontSize: 18, color: "#94a3b8" }}>({item.variety})</span>
                </div>
                <div style={{ fontSize: 28, color: "#4ade80", fontWeight: 900 }}>₹{item.max_price}</div>
              </div>
            ))}
          </div>

          {/* Top 5 Arrivals */}
          <div
            style={{
              backgroundColor: "#0284c7",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            🚜 सर्वाधिक आवक असणारे टॉप ५ मार्केट
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topArrivals.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  padding: "10px 20px",
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "6px solid #0284c7",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  <span style={{ color: "#38bdf8", marginRight: 12 }}>#{idx + 1}</span>
                  {item.market} <span style={{ fontSize: 18, color: "#94a3b8" }}>(दर: ₹{item.avg_price})</span>
                </div>
                <div style={{ fontSize: 28, color: "#38bdf8", fontWeight: 900 }}>{item.quantity} क्विं.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ४. टेबल स्लाईड्स (१४ - १४ मार्केटचा अचूक संच - Safe Top Placement) */}
      {isTableSlide && (
        <div style={{ position: "absolute", top: 175, left: 24, right: 24 }}>
          {/* Table Sub-Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              padding: "0 8px",
            }}
          >
            <span style={{ fontSize: 22, color: "#fef08a", fontWeight: 800 }}>📌 {slideTitle}</span>
            <span style={{ fontSize: 20, color: "#94a3b8" }}>दर प्रति क्विंटल (₹)</span>
          </div>

          {/* Table Header Row */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#1e293b",
              padding: "10px 14px",
              borderRadius: "12px 12px 0 0",
              fontWeight: 800,
              fontSize: 20,
              color: "#cbd5e1",
              borderBottom: "2px solid #334155",
            }}
          >
            <div style={{ flex: 2.2 }}>मार्केट</div>
            <div style={{ flex: 1.2, textAlign: "center" }}>जात</div>
            <div style={{ flex: 1.3, textAlign: "center" }}>आवक(क्विं.)</div>
            <div style={{ flex: 1.2, textAlign: "center" }}>कमी</div>
            <div style={{ flex: 1.2, textAlign: "center" }}>जास्त</div>
            <div style={{ flex: 1.4, textAlign: "center", color: "#4ade80" }}>सरासरी</div>
          </div>

          {/* १४ Rows Container (ऊंची ८८०px मध्ये अचूक बसवली आहे) */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: "0 0 12px 12px",
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
                  padding: "9px 14px",
                  height: "56px",
                  boxSizing: "border-box",
                  backgroundColor: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontSize: 21,
                  fontWeight: 600,
                }}
              >
                <div style={{ flex: 2.2, color: "#ffffff", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.market}
                </div>
                <div style={{ flex: 1.2, textAlign: "center", color: "#94a3b8", fontSize: 18 }}>
                  {item.variety || "लोकल"}
                </div>
                <div style={{ flex: 1.3, textAlign: "center", color: "#cbd5e1", fontWeight: 700 }}>
                  {item.quantity}
                </div>
                <div style={{ flex: 1.2, textAlign: "center", color: "#f87171" }}>₹{item.min_price}</div>
                <div style={{ flex: 1.2, textAlign: "center", color: "#38bdf8" }}>₹{item.max_price}</div>
                <div style={{ flex: 1.4, textAlign: "center", color: "#4ade80", fontWeight: 900, fontSize: 23 }}>
                  ₹{item.avg_price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ५. कायमस्वरूपी तळभागातील जाहिरात / सुरक्षित क्षेत्र (Bottom YouTube/Reels Safe Zone Banner) */}
      {!isOutro && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 24,
            right: 24,
            height: "360px",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            borderRadius: 24,
            border: "2px dashed #eab308",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px 30px",
            boxShadow: "0 -10px 35px rgba(0,0,0,0.6)",
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fef08a", marginBottom: 12 }}>
            📢 दररोजचे ताजे कांदा बाजार भाव
          </div>
          <div style={{ fontSize: 25, color: "#ffffff", fontWeight: 700, lineHeight: 1.4 }}>
            दररोजच्या अचूक बाजारभावाच्या अपडेटसाठी आपल्या चॅनलला आत्ताच
          </div>
          <div
            style={{
              marginTop: 20,
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              padding: "14px 45px",
              borderRadius: 50,
              fontSize: 30,
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

      {/* ६. अंतिम आउट्रो स्क्रीन (४७ ते ५३ सेकंद) */}
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
          <h2 style={{ fontSize: 50, color: "#ffffff", marginTop: 25, lineHeight: 1.4, fontWeight: 900 }}>
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
