import React from "react";
import { Composition } from "remotion";
import { OnionRateVideo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OnionRateComposition"
        component={OnionRateVideo}
        durationInFrames={690}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          data: {
            date: "03/09/2026",
            state: "महाराष्ट्र",
            records: [
              {
                market: "पुणे",
                variety: "लोकल",
                quantity: "150",
                min_price: "2500",
                max_price: "4500",
                avg_price: "3500"
              },
              {
                market: "नाशिक",
                variety: "उन्हाळी",
                quantity: "320",
                min_price: "2800",
                max_price: "4700",
                avg_price: "3900"
              }
            ]
          }
        }}
      />
    </>
  );
};
