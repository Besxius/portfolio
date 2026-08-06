"use client";

import React, { useRef, useState, useEffect } from "react";
import LightRays, { RaysOrigin } from "@/components/ui/light-rays";
import { TLMarkIsometric } from "@/components/ui/tl-mark-isometric";

interface TLMarkLightRaysProps {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  className?: string;
}

export function TLMarkLightRays({
  raysOrigin = "top-right",
  raysColor = "#38bdf8",
  raysSpeed = 1.2,
  lightSpread = 1.4,
  rayLength = 1.2,
  followMouse = true,
  mouseInfluence = 0.25,
  className = "",
}: TLMarkLightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowIntensity, setGlowIntensity] = useState(1);

  useEffect(() => {
    // Subtle pulsing ambient light interaction
    const interval = setInterval(() => {
      setGlowIntensity(0.85 + Math.sin(Date.now() * 0.003) * 0.15);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none group ${className}`}
    >
      {/* 1. WebGL LightRays Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-85 transition-opacity duration-500 group-hover:opacity-100">
        <LightRays
          raysOrigin={raysOrigin}
          raysColor={raysColor}
          raysSpeed={raysSpeed}
          lightSpread={lightSpread}
          rayLength={rayLength}
          followMouse={followMouse}
          mouseInfluence={mouseInfluence}
          distortion={0.12}
          pulsating={true}
          fadeDistance={1.2}
          saturation={1.2}
        />
      </div>

      {/* 2. Interactive Light Reflection / Bloom Aura behind the TL Logo */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 75% 35%, ${raysColor}30 0%, transparent 50%)`,
          opacity: glowIntensity,
        }}
      />

      {/* 3. Front-Facing 3D TL Mark Graphic Layer (Positioned as Header Background Graphic) */}
      <div className="absolute inset-0 z-20 flex items-center justify-end pr-2 md:pr-8 pl-32 pointer-events-auto opacity-75 dark:opacity-90 transition-transform duration-300">
        <div className="w-full max-w-[460px] md:max-w-[520px]">
          <TLMarkIsometric />
        </div>
      </div>
    </div>
  );
}

export default TLMarkLightRays;
