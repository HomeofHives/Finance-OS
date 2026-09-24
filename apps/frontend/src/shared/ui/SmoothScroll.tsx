import { useEffect } from "react";
import Lenis from "lenis";

// Lenis also resolves anchor links, honoring the nav's scroll-padding.
export function SmoothScroll() {
   useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const lenis = new Lenis({
         duration: 1.2,
         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
         smoothWheel: true,
         anchors: true,
      });

      let rafId: number | undefined;
      const raf = (time: number) => {
         lenis.raf(time);
         rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      return () => {
         if (rafId !== undefined) cancelAnimationFrame(rafId);
         lenis.destroy();
      };
   }, []);

   return null;
}
