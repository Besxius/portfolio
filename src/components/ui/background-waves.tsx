"use client";

import React, { useEffect, useState } from "react";
import GradientWaves from "@/components/ui/gradient-waves";
import { useAppContext } from "@/utils/providers";

export function BackgroundWaves() {
  const { colorTheme } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-background" />;
  }

  const isBlue = colorTheme === "blue";

  // Palette configuration for Dark Blue and Dark Green
  const themeColors = isBlue
    ? {
      horizonColor: "#020617", // Dark Navy Slate
      waveColor: "#0f2b5c",    // Deep Oceanic Blue
      crestColor: "#38bdf8",   // Bright Cyan Crest Accent
    }
    : {
      horizonColor: "#022c22", // Dark Forest Emerald
      waveColor: "#065f46",    // Deep Emerald Green
      crestColor: "#34d399",   // Vibrant Mint Crest Accent
    };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-75 transition-colors duration-700">
      <GradientWaves
        horizonColor={themeColors.horizonColor}
        waveColor={themeColors.waveColor}
        crestColor={themeColors.crestColor}
        speed={0.5}
        amplitude={2.2}
        waveScale={0.65}
        waveRatio={0.9}
        swell={28}
        turbulence={18}
        tilt={1.1}
        zoom={1.0}
        height={4.8}
        fogDepth={16}
        detail="medium"
        brightness={0.85}
        opacity={0.85}
        mouseInteraction={true}
        parallaxStrength={0.4}
        grain={true}
        grainIntensity={0.04}
      />
    </div>
  );
}
