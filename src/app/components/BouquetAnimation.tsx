"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface BouquetAnimationProps {
  src: string;
  mode?: "lottie" | "svg";
  onLayerClick?: (id: string) => void;
}

export default function BouquetAnimation({ src, mode = "svg", onLayerClick }: BouquetAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const idleTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Fetch the SVG content
    fetch(src)
      .then((res) => res.text())
      .then((data) => setSvgContent(data));
  }, [src]);

  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Bloom Sequence
      timelineRef.current = gsap.timeline();
      
      gsap.set("#cone", { opacity: 0, scaleY: 0.95 });
      gsap.set("[id^='flower_']", { opacity: 0, scale: 0.6 });
      gsap.set("#shadow_cone", { opacity: 0 });

      timelineRef.current
        .to("#cone", { opacity: 1, scaleY: 1.0, duration: 0.2, ease: "power2.out" })
        .to("[id^='flower_']", {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          stagger: 0.12,
          ease: "back.out(1.4)"
        }, "-=0.1")
        .to("#shadow_cone", { opacity: 1, duration: 1 }, "-=1")
        .add(() => {
          // Start idle loop after bloom
          idleTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true });
          idleTimelineRef.current.to("[id^='flower_']", {
            y: "random(-6, 6)",
            rotation: "random(-1.5, 1.5)",
            duration: 3,
            ease: "sine.inOut",
            stagger: {
              each: 0.5,
              from: "random"
            }
          });
        });

      // Attach click listeners to hit areas
      const hitAreas = containerRef.current?.querySelectorAll("[id$='_hit']");
      hitAreas?.forEach((hit) => {
        hit.addEventListener("click", () => {
          const flowerId = hit.id.replace("_hit", "");
          
          // Pulse animation on click
          gsap.to(`#${flowerId}`, {
            scale: 1.08,
            duration: 0.18,
            yoyo: true,
            repeat: 1
          });

          if (onLayerClick) {
            onLayerClick(flowerId);
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [svgContent, onLayerClick]);

  if (!svgContent) {
    return <div className="w-full h-[600px] bg-cream/50 animate-pulse rounded-lg"></div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-2xl mx-auto drop-shadow-2xl"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
      aria-label="Animated Bouquet"
      role="img"
    />
  );
}
