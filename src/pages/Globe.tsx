/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 */

import { useEffect, useRef, useState } from "react";

// Lazy import globe.gl to avoid bundling three.js on initial load
let GlobeConstructor: any = null;
async function loadGlobe() {
  if (!GlobeConstructor) {
    const mod = await import("globe.gl");
    GlobeConstructor = mod.default || mod.Globe || mod;
  }
  return GlobeConstructor;
}

export default function GlobePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initGlobe() {
      try {
        const Globe = await loadGlobe();
        if (!mounted || !containerRef.current) return;

        // Create the globe
        const world = Globe()(containerRef.current, {
          animateIn: true,
        })
          .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
          .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);

        globeRef.current = world;

        // Auto-rotate
        world.controls().autoRotate = true;
        world.controls().autoRotateSpeed = 0.3;
        world.controls().enableZoom = true;
        world.controls().enableDamping = true;
        world.controls().dampingFactor = 0.1;
        world.controls().rotateSpeed = 0.5;

        // Stop auto-rotate when user interacts
        const controls = world.controls();
        let interactionTimeout: any = null;
        controls.addEventListener("start", () => {
          if (autoRotate) {
            controls.autoRotate = false;
          }
          if (interactionTimeout) clearTimeout(interactionTimeout);
        });
        controls.addEventListener("end", () => {
          if (interactionTimeout) clearTimeout(interactionTimeout);
          if (autoRotate) {
            interactionTimeout = setTimeout(() => {
              if (globeRef.current && mounted) {
                globeRef.current.controls().autoRotate = true;
              }
            }, 5000);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Globe init failed:", err);
        setLoading(false);
      }
    }

    initGlobe();

    // Handle resize
    function handleResize() {
      if (globeRef.current && containerRef.current) {
        globeRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    }
    window.addEventListener("resize", handleResize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) {
        try {
          globeRef.current._destructor && globeRef.current._destructor();
        } catch (e) {
          // cleanup
        }
      }
    };
  }, []);

  const toggleRotate = () => {
    if (globeRef.current) {
      const newVal = !autoRotate;
      setAutoRotate(newVal);
      globeRef.current.controls().autoRotate = newVal;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="page-title text-electric">Live Earth View</h2>
        <p className="page-subtitle">Spin the globe to explore. Campaign pins coming soon.</p>
      </div>

      {/* Globe container */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ifdark">
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-ifcyan animate-pulse-glow" />
              <span className="w-2 h-2 rounded-full bg-ifaccent animate-pulse-glow" style={{ animationDelay: "0.2s" }} />
              <span className="w-2 h-2 rounded-full bg-ifcyan animate-pulse-glow" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        {/* Auto-rotate toggle */}
        {!loading && (
          <button
            onClick={toggleRotate}
            className="absolute bottom-4 right-4 z-10 bg-ifcard/80 backdrop-blur border border-ifborder rounded-full px-4 py-2 text-xs text-iftext"
          >
            {autoRotate ? "II Pause" : "▶ Spin"}
          </button>
        )}

        {/* Future search bar (placeholder) */}
        {!loading && (
          <div className="absolute top-2 left-4 right-16 z-10">
            <div className="bg-ifcard/80 backdrop-blur border border-ifborder rounded-xl px-4 py-2.5 text-xs text-ifmuted text-center">
              Search by address, neighborhood, or city — coming soon
            </div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-4 py-3 orbit-divider mt-2">
        <div className="flex items-center justify-between text-[10px] text-ifmuted">
          <span>Interplanetary Fund — Global Campaign Locator</span>
          <span className="text-ifcyan">Live</span>
        </div>
      </div>
    </div>
  );
}
