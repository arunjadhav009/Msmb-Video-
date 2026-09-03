import React from "react";
import { Composition } from "remotion";
import { OnionRateVideo } from "./Composition";

let dynamicData;
try {
  dynamicData = require("./data.json");
} catch (e) {
  dynamicData = {
    date: "02/09/2026",
    state: "महाराष्ट्र",
    records: []
  };
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OnionRateComposition"
        component={OnionRateVideo}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          data: dynamicData
        }}
      />
    </>
  );
};
