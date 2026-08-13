"use client";

import { LiquidMetal } from "@paper-design/shaders-react";

// "use client" tells Next.js this one runs in the browser, not on the
// server. WebGL needs a real graphics card and a real screen, neither of
// which exist on Vercel's machine.
export function LiquidHeader() {
  return (
    <div className="relative h-64 w-full overflow-hidden">
      <LiquidMetal
        className="absolute inset-0 h-full w-full"
        shape="metaballs"
        colorBack="#08080a"
        colorTint="#cfd3dc"
        repetition={4}
        softness={0.35}
        shiftRed={0.2}
        shiftBlue={-0.2}
        distortion={0.12}
        contour={0.85}
        speed={0.6}
        scale={0.55}
        offsetX={0.35}
      />
      {/* Fade the shader into the page background so it has no hard edge. */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
