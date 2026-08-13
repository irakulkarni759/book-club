"use client";

import { LiquidMetal } from "@paper-design/shaders-react";

// The wordmark is a PNG of "bis book club" set in Milkyway, white on
// transparent, one straight line. The shader uses that shape as a mask
// and pours metal into it, the way paper-design/liquid-logo does.
export function LiquidWordmark() {
  return (
    <div className="aspect-[2374/437] w-full max-w-md shrink-0">
      <LiquidMetal
        className="h-full w-full"
        image="/wordmark.png"
        colorBack="#00000000"
        colorTint="#cfd3dc"
        repetition={3}
        softness={0.3}
        shiftRed={0.2}
        shiftBlue={-0.2}
        distortion={0.09}
        contour={0.9}
        speed={0.5}
        fit="contain"
      />
    </div>
  );
}
