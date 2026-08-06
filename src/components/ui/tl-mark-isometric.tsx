"use client";

import { useEffect, useId, useRef, useState } from "react";

export function TLMarkIsometric() {
  const id = useId();
  const ids = {
    facePattern: `tl-front-pattern-${id}`,
    faceFill: `tl-front-fill-${id}`,
    stroke: `tl-front-stroke-${id}`,
    radialGradient: `tl-front-gradient-${id}`,
    glowFilter: `tl-front-glow-${id}`,
  };

  const ref = useRef<SVGSVGElement>(null);

  // Initialize mouse position at center
  const [mousePos, setMousePos] = useState({ x: 300, y: 200 });
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Convert global cursor pos to SVG viewBox coordinates (600 x 400)
      const x = ((e.clientX - rect.left) / rect.width) * 600;
      const y = ((e.clientY - rect.top) / rect.height) * 400;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <svg
      ref={ref}
      className="h-auto w-full touch-manipulation overflow-visible [--pattern:color-mix(in_oklab,var(--foreground)_18%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_45%,var(--background))]"
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <defs>
        {/* Glow filter for edge light interaction */}
        <filter id={ids.glowFilter} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Diagonal hatch pattern */}
        <pattern
          id={ids.facePattern}
          x="0"
          y="0"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-1 1l2 -2M0 12l12 -12M11 13l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1.2"
          />
        </pattern>

        {/* Front Faces of T and L */}
        <g
          id={ids.faceFill}
          className="transition-transform duration-200 ease-out"
          style={{ transform: isPressed ? "translateY(8px)" : "translateY(0px)" }}
        >
          {/* Front Face T */}
          <path d="M 100 80 H 260 V 130 H 205 V 300 H 155 V 130 H 100 Z" />

          {/* Front Face L */}
          <path d="M 320 80 H 370 V 250 H 480 V 300 H 320 Z" />
        </g>

        {/* All Stroke Outlines (Front + 3D Bevel Facets) */}
        <g
          id={ids.stroke}
          className="transition-transform duration-200 ease-out"
          style={{ transform: isPressed ? "translateY(8px)" : "translateY(0px)" }}
        >
          {/* T Front Outline */}
          <path d="M 100 80 H 260 V 130 H 205 V 300 H 155 V 130 H 100 Z" />
          {/* T Bevel Lines */}
          <path d="M 100 80 L 115 65 H 275 V 115 L 260 130" />
          <path d="M 260 80 L 275 65" />
          <path d="M 205 130 L 220 115 V 285 L 205 300" />
          <path d="M 155 300 L 170 285 H 220" />

          {/* L Front Outline */}
          <path d="M 320 80 H 370 V 250 H 480 V 300 H 320 Z" />
          {/* L Bevel Lines */}
          <path d="M 320 80 L 335 65 H 385 V 235 H 495 V 285 L 480 300" />
          <path d="M 370 80 L 385 65" />
          <path d="M 370 250 L 385 235" />
          <path d="M 480 250 L 495 235" />
        </g>

        {/* Dynamic Spotlight Radial Gradient (light interaction) */}
        <radialGradient
          id={ids.radialGradient}
          cx={mousePos.x}
          cy={mousePos.y}
          r="260"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            className="dark:[stop-color:#ffffff]"
            stopColor="var(--color-zinc-100)"
            stopOpacity="1"
          />
          <stop
            className="dark:[stop-color:#38bdf8]"
            offset="0.5"
            stopColor="var(--color-zinc-400)"
            stopOpacity="0.8"
          />
          <stop
            className="dark:[stop-color:var(--color-zinc-600)]"
            offset="1"
            stopColor="var(--color-zinc-600)"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      {/* Background Architectural Grid Lines */}
      <g className="stroke-line opacity-30" stroke="var(--stroke)" strokeWidth="1" strokeDasharray="4 4">
        <line x1="40" y1="80" x2="560" y2="80" />
        <line x1="40" y1="130" x2="560" y2="130" />
        <line x1="40" y1="250" x2="560" y2="250" />
        <line x1="40" y1="300" x2="560" y2="300" />
        <line x1="100" y1="30" x2="100" y2="350" />
        <line x1="205" y1="30" x2="205" y2="350" />
        <line x1="320" y1="30" x2="320" y2="350" />
        <line x1="480" y1="30" x2="480" y2="350" />
      </g>

      {/* 3D Depth Facets (Top & Right Bevel Surfaces) */}
      <g
        className="fill-background opacity-90 transition-transform duration-200 ease-out"
        fill="var(--background)"
        style={{ transform: isPressed ? "translateY(8px)" : "translateY(0px)" }}
      >
        {/* T Top Depth Surface */}
        <path d="M 100 80 L 115 65 H 275 L 260 80 Z" fill="var(--pattern)" opacity="0.6" />
        {/* T Right Depth Surfaces */}
        <path d="M 260 80 L 275 65 V 115 L 260 130 Z" fill="var(--pattern)" opacity="0.4" />
        <path d="M 205 130 L 220 115 V 285 L 205 300 Z" fill="var(--pattern)" opacity="0.4" />
        {/* T Bottom Depth Surface */}
        <path d="M 155 300 L 170 285 H 220 L 205 300 Z" fill="var(--pattern)" opacity="0.3" />

        {/* L Top Depth Surfaces */}
        <path d="M 320 80 L 335 65 H 385 L 370 80 Z" fill="var(--pattern)" opacity="0.6" />
        <path d="M 370 250 L 385 235 H 495 L 480 250 Z" fill="var(--pattern)" opacity="0.6" />
        {/* L Right Depth Surfaces */}
        <path d="M 370 80 L 385 65 V 235 L 370 250 Z" fill="var(--pattern)" opacity="0.4" />
        <path d="M 480 250 L 495 235 V 285 L 480 300 Z" fill="var(--pattern)" opacity="0.4" />
      </g>

      {/* Front Faces with Pattern */}
      <use href={`#${ids.faceFill}`} className="fill-background" />
      <use href={`#${ids.faceFill}`} fill={`url(#${ids.facePattern})`} />

      {/* Base Visible Outlines */}
      <use href={`#${ids.stroke}`} stroke="var(--stroke)" strokeWidth="1.5" className="opacity-80" />

      {/* Interactive Glowing Laser Stroke Overlay (Interacts with Mouse & Light Rays) */}
      <use
        href={`#${ids.stroke}`}
        stroke={`url(#${ids.radialGradient})`}
        strokeWidth="3"
        filter={`url(#${ids.glowFilter})`}
      />
    </svg>
  );
}

export { TLMarkIsometric as ChanhDaiMarkIsometric };
