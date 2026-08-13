"use client";

import { LiquidMetal } from "@paper-design/shaders-react";

// The wordmark is a PNG of "bis book club" set in Shrofa, white on
// transparent. The shader uses that shape as a mask and pours metal
// into it, which is exactly how paper-design/liquid-logo works.
export function LiquidWordmark() {
  return (
    <div className="relative aspect-[1804/1147] w-full max-w-lg">
      <LiquidMetal
        className="absolute inset-0 h-full w-full"
        image="/wordmark.png"
        colorBack="#00000000"
        colorTint="#cfd3dc"
        repetition={3.5}
        softness={0.32}
        shiftRed={0.22}
        shiftBlue={-0.22}
        distortion={0.1}
        contour={0.9}
        speed={0.5}
        fit="contain"
      />
    </div>
  );
}
