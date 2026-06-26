"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

// Expanded flower types
type FlowerType =
  | "rose"
  | "dahlia"
  | "daisy"
  | "peony"
  | "tulip"
  | "orchid"
  | "lily_of_the_valley"
  | "sunflower"
  | "calla_lily"
  | "lilac"
  | "zinnia";

interface FlowerState {
  id: string;
  xPercent: number; // Horizontal placement percentage (5 - 95)
  height: number; // Max stem height in px
  type: FlowerType;
  colorTheme: string; // Dynamic hex color
  stemCurve: number; // Bend offset
  isFalling: boolean;
  growKey: number; // Key to trigger bloom animations
  depthLayer: 0 | 1 | 2; // 0: bg, 1: mid, 2: fg
}

interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  gravity: number;
  type: "sparkle" | "pee";
}

const FLOWER_COLORS = [
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#22d3ee", // Cyan
  "#a855f7", // Purple
  "#fbbf24", // Gold Yellow
  "#f97316", // Orange
  "#60a5fa", // Blue
  "#e11d48", // Crimson
  "#c084fc", // Lavender
  "#34d399"  // Mint
];

const FLOWER_TYPES: FlowerType[] = [
  "rose",
  "dahlia",
  "daisy",
  "peony",
  "tulip",
  "orchid",
  "lily_of_the_valley",
  "sunflower",
  "calla_lily",
  "lilac",
  "zinnia"
];

// Hex to RGBA parser for canvas drawings
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- HIGHLY DETAILED SVG RENDER HELPERS ---

const renderDahlia = (x: number, y: number, color: string) => {
  return (
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = i * (360 / 14);
        return (
          <path
            key={`dah-o-${i}`}
            d={`M ${x} ${y - 20} L ${x + 6} ${y} L ${x} ${y + 5} L ${x - 6} ${y} Z`}
            fill={color}
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = i * (360 / 10) + 18;
        return (
          <path
            key={`dah-m-${i}`}
            d={`M ${x} ${y - 14} L ${x + 4} ${y} L ${x} ${y + 4} L ${x - 4} ${y} Z`}
            fill={color}
            opacity="0.85"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = i * (360 / 7) + 9;
        return (
          <path
            key={`dah-i-${i}`}
            d={`M ${x} ${y - 9} L ${x + 3} ${y} L ${x} ${y + 3} L ${x - 3} ${y} Z`}
            fill="#ffffff"
            opacity="0.35"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      <circle cx={x} cy={y} r="5" fill="#fef08a" />
    </g>
  );
};

const renderPeony = (x: number, y: number, color: string) => {
  return (
    <g>
      <circle cx={x} cy={y} r="21" fill={color} opacity="0.5" />
      <circle cx={x - 10} cy={y - 8} r="13" fill={color} opacity="0.75" />
      <circle cx={x + 10} cy={y - 8} r="13" fill={color} opacity="0.75" />
      <circle cx={x - 8} cy={y + 10} r="13" fill={color} opacity="0.75" />
      <circle cx={x + 8} cy={y + 10} r="13" fill={color} opacity="0.75" />
      <circle cx={x} cy={y - 12} r="11" fill={color} opacity="0.85" />
      <circle cx={x} cy={y + 6} r="12" fill={color} opacity="0.85" />
      
      <circle cx={x} cy={y} r="10" fill={color} />
      <circle cx={x - 4} cy={y - 3} r="6" fill="#ffffff" opacity="0.2" />
      <circle cx={x + 3} cy={y + 3} r="5" fill="#ffffff" opacity="0.2" />
      <circle cx={x} cy={y} r="8" fill={color} />

      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * 60;
        return (
          <circle
            key={i}
            cx={x}
            cy={y - 5}
            r="1.8"
            fill="#fbbf24"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
    </g>
  );
};

const renderDaisy = (x: number, y: number) => {
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = i * (360 / 16);
        return (
          <ellipse
            key={`dais-p1-${i}`}
            cx={x}
            cy={y - 18}
            rx="4.5"
            ry="15"
            fill="#ffffff"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * (360 / 12) + 15;
        return (
          <ellipse
            key={`dais-p2-${i}`}
            cx={x}
            cy={y - 14}
            rx="3.5"
            ry="11"
            fill="#f1f5f9"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      <circle cx={x} cy={y} r="8" fill="#fbbf24" />
      <circle cx={x} cy={y} r="5" fill="#d97706" opacity="0.3" />
      <circle cx={x - 2} cy={y - 2} r="2.2" fill="#ffffff" opacity="0.6" />
    </g>
  );
};

const renderTulip = (x: number, y: number, color: string) => {
  return (
    <g>
      <path
        d={`M ${x} ${y + 12} C ${x - 22} ${y - 14}, ${x - 14} ${y - 28}, ${x - 5} ${y - 15} Z`}
        fill={color}
      />
      <path
        d={`M ${x} ${y + 12} C ${x + 22} ${y - 14}, ${x + 14} ${y - 28}, ${x + 5} ${y - 15} Z`}
        fill={color}
      />
      <path
        d={`M ${x} ${y + 14} C ${x - 9} ${y - 23}, ${x + 9} ${y - 23}, ${x} ${y + 14} Z`}
        fill="#f97316"
        opacity="0.95"
      />
      <path
        d={`M ${x - 5} ${y + 8} Q ${x} ${y + 17}, ${x + 5} ${y + 8} Z`}
        fill="#059669"
      />
    </g>
  );
};

const renderOrchid = (x: number, y: number, color: string) => {
  return (
    <g>
      <path d={`M ${x} ${y} L ${x - 22} ${y - 16} Q ${x - 10} ${y - 5}, ${x} ${y - 6} Z`} fill={color} opacity="0.75" />
      <path d={`M ${x} ${y} L ${x + 22} ${y - 16} Q ${x + 10} ${y - 5}, ${x} ${y - 6} Z`} fill={color} opacity="0.75" />
      <path d={`M ${x} ${y} Q ${x - 5} ${y + 20}, ${x} ${y + 24} Q ${x + 5} ${y + 20}, ${x} ${y} Z`} fill={color} opacity="0.75" />
      
      <ellipse cx={x - 12} cy={y - 4} rx="12" ry="8" fill={color} style={{ transform: "rotate(-12deg)", transformOrigin: `${x}px ${y}px` }} />
      <ellipse cx={x + 12} cy={y - 4} rx="12" ry="8" fill={color} style={{ transform: "rotate(12deg)", transformOrigin: `${x}px ${y}px` }} />
      
      <path d={`M ${x - 7} ${y + 1} Q ${x} ${y + 13}, ${x + 7} ${y + 1} Q ${x} ${y + 5}, ${x - 7} ${y + 1}`} fill="#fef08a" />
      <path d={`M ${x - 4} ${y + 2} Q ${x} ${y + 8}, ${x + 4} ${y + 2}`} fill="#ec4899" />
      <circle cx={x} cy={y + 1} r="1.5" fill="#ef4444" />
    </g>
  );
};

const renderLilyOfTheValley = (x: number, y: number) => {
  return (
    <g>
      <g transform={`translate(${x - 14}, ${y + 4})`}>
        <path d="M 0 -4 Q -6 0, -8 4" stroke="#059669" strokeWidth="2" fill="none" />
        <path d="M -13 4 C -13 -1, -7 -1, -7 4 C -7 7, -5 9, -7 10 L -13 10 C -15 9, -13 7, -13 4" fill="#ffffff" />
        <circle cx="-10" cy="10" r="1.2" fill="#fef08a" />
      </g>
      <g transform={`translate(${x + 12}, ${y - 8})`}>
        <path d="M -2 -4 Q 4 0, 6 4" stroke="#059669" strokeWidth="2" fill="none" />
        <path d="M 2 4 C 2 -1, 8 -1, 8 4 C 8 7, 10 9, 8 10 L 2 10 C 0 9, 2 7, 2 4" fill="#ffffff" />
        <circle cx="5" cy="10" r="1.2" fill="#fef08a" />
      </g>
      <g transform={`translate(${x - 2}, ${y - 22})`}>
        <path d="M 0 0 C -3 -5, 3 -5, 3 0 C 3 3, 5 5, 3 6 L -3 6 C -5 5, -3 3, -3 0" fill="#ffffff" style={{ transform: "rotate(-12deg)" }} />
        <circle cx="0" cy="6" r="1" fill="#fef08a" />
      </g>
    </g>
  );
};

const renderSunflower = (x: number, y: number) => {
  return (
    <g>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = i * 18;
        return (
          <path
            key={`sun-p-${i}`}
            d={`M ${x} ${y - 24} L ${x + 6} ${y} L ${x} ${y + 4} L ${x - 6} ${y} Z`}
            fill="#fbbf24"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      <circle cx={x} cy={y} r="12" fill="#2d1500" />
      <circle cx={x} cy={y} r="9" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx={x} cy={y} r="6" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="1 2" />
    </g>
  );
};

const renderCallaLily = (x: number, y: number) => {
  return (
    <g>
      <path
        d={`M ${x} ${y + 18} C ${x - 24} ${y + 4}, ${x - 16} ${y - 24}, ${x} ${y - 26} C ${x + 16} ${y - 24}, ${x + 24} ${y + 4}, ${x} ${y + 18} Z`}
        fill="#ffffff"
      />
      <path
        d={`M ${x} ${y + 18} Q ${x - 8} ${y - 3}, ${x} ${y - 18} Q ${x + 8} ${y - 3}, ${x} ${y + 18}`}
        fill="#f8fafc"
      />
      <rect x={x - 1.8} y={y - 16} width="3.6" height="22" rx="1.8" fill="#eab308" />
    </g>
  );
};

const renderLilac = (x: number, y: number) => {
  const flowerColor = "#d8b4fe";
  const positions = [
    { dx: 0, dy: -22 },
    { dx: -6, dy: -15 }, { dx: 6, dy: -15 },
    { dx: -10, dy: -6 }, { dx: 0, dy: -6 }, { dx: 10, dy: -6 },
    { dx: -13, dy: 4 }, { dx: -4, dy: 4 }, { dx: 4, dy: 4 }, { dx: 13, dy: 4 },
    { dx: -8, dy: 14 }, { dx: 0, dy: 14 }, { dx: 8, dy: 14 },
    { dx: -4, dy: 23 }, { dx: 4, dy: 23 }
  ];
  return (
    <g>
      {positions.map((pos, i) => (
        <g key={i} transform={`translate(${x + pos.dx}, ${y + pos.dy})`}>
          <circle cx="-2.5" cy="0" r="2.5" fill={flowerColor} />
          <circle cx="2.5" cy="0" r="2.5" fill={flowerColor} />
          <circle cx="0" cy="-2.5" r="2.5" fill={flowerColor} />
          <circle cx="0" cy="2.5" r="2.5" fill={flowerColor} />
          <circle cx="0" cy="0" r="0.8" fill="#fbbf24" />
        </g>
      ))}
    </g>
  );
};

const renderZinnia = (x: number, y: number, color: string) => {
  return (
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = i * (360 / 14);
        return (
          <path
            key={`zin-r1-${i}`}
            d={`M ${x - 5} ${y - 19} L ${x + 5} ${y - 19} L ${x + 3} ${y} L ${x - 3} ${y} Z`}
            fill={color}
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = i * (360 / 9) + 20;
        return (
          <path
            key={`zin-r2-${i}`}
            d={`M ${x - 4} ${y - 13} L ${x + 4} ${y - 13} L ${x + 2} ${y} L ${x - 2} ${y} Z`}
            fill={color}
            opacity="0.85"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      <circle cx={x} cy={y} r="5.5" fill="#f59e0b" />
      <circle cx={x} cy={y} r="2.5" fill="#ef4444" />
    </g>
  );
};

// --- MAIN GARDEN COMPONENT ---

interface InteractiveGardenProps {
  isActivated: boolean;
  onFlowersChange?: (positions: number[]) => void;
}

export default function InteractiveGarden({ isActivated, onFlowersChange }: InteractiveGardenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flowers, setFlowers] = useState<FlowerState[]>([]);
  
  // Lightweight JavaScript array of particles to bypass React rerender cycles completely
  const particlesRef = useRef<CanvasParticle[]>([]);
  const hasGrownRef = useRef<Record<string, number>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize flowers dynamically based on screen width (less dense on mobile)
  useEffect(() => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const count = isMobile ? 35 : 100;
    const spacing = isMobile ? 2.5 : 0.9;
    
    const generatedFlowers: FlowerState[] = [];
    for (let i = 0; i < count; i++) {
      const xPercent = 5 + (i * spacing) + (Math.random() * 0.6 - 0.3);
      const depthLayer = (i % 3) as 0 | 1 | 2;
      
      let height = 260;
      if (depthLayer === 0) {
        height = 170 + Math.floor(Math.random() * 60);
      } else if (depthLayer === 1) {
        height = 230 + Math.floor(Math.random() * 60);
      } else {
        height = 280 + Math.floor(Math.random() * 70);
      }

      const type = FLOWER_TYPES[i % FLOWER_TYPES.length];
      const colorTheme = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      const stemCurve = (Math.random() * 22) - 11;

      generatedFlowers.push({
        id: `fl-${i}`,
        xPercent,
        height,
        type,
        colorTheme,
        stemCurve,
        isFalling: false,
        growKey: 1,
        depthLayer
      });
    }
    setFlowers(generatedFlowers);
  }, []);

  // Lazy-load a single shared AudioContext to prevent context limits and audio thread lag
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Web Audio Synth for Ethereal Sparkle Sound (reusing shared AudioContext)
  const playSparkleSound = (freqStart = 800, freqEnd = 2400, type: OscillatorType = "sine") => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  };

  // Dispatch particles to canvas update loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const resize = () => {
      canvas.width = containerRef.current?.clientWidth || window.innerWidth;
      canvas.height = containerRef.current?.clientHeight || window.innerHeight;
    };

    const updateAndDrawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particlesRef.current;

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        
        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.opacity -= p.type === "pee" ? 0.024 : 0.02;

        // Cleanup out-of-bounds or dead particles
        if (p.opacity <= 0 || p.x < -100 || p.x > canvas.width + 100 || p.y > canvas.height + 50) {
          pts.splice(i, 1);
          continue;
        }

        // Draw particle with glow filter
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.type === "pee") {
          ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = hexToRgba(p.color, p.opacity);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 5;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }

      animFrameId = requestAnimationFrame(updateAndDrawParticles);
    };

    window.addEventListener("resize", resize);
    resize();
    animFrameId = requestAnimationFrame(updateAndDrawParticles);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Expose global particle hooks for 60fps lightweight calls from other components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).spawnGardenSparkles = (x: number, y: number, color: string, count = 10, isRise = false) => {
        const newParticles: CanvasParticle[] = [];
        for (let i = 0; i < count; i++) {
          const angle = isRise 
            ? -Math.PI / 2 + (Math.random() * 0.6 - 0.3) 
            : Math.random() * Math.PI * 2;
          const speed = isRise ? Math.random() * 2.2 + 1.1 : Math.random() * 3.2 + 1.4;
          
          newParticles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            size: Math.random() * 3.5 + 2,
            opacity: 1.0,
            gravity: isRise ? -0.025 : 0.11,
            type: "sparkle"
          });
        }
        particlesRef.current.push(...newParticles);
      };

      (window as any).spawnGardenPee = (x: number, y: number, isLeft: boolean) => {
        // Generates stream droplets flowing onto the stem base
        particlesRef.current.push({
          x,
          y,
          vx: (isLeft ? -1.3 : 1.3) - Math.random() * 0.9 * (isLeft ? 1 : -1),
          vy: -0.5 - Math.random() * 0.7,
          color: "#fbbf24",
          size: Math.random() * 2.0 + 2.0,
          opacity: 1.0,
          gravity: 0.15,
          type: "pee"
        });
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).spawnGardenSparkles;
        delete (window as any).spawnGardenPee;
      }
    };
  }, []);

  // Report active flower positions to parent shell
  useEffect(() => {
    if (onFlowersChange && flowers.length > 0) {
      const activePositions = flowers
        .filter((f) => !f.isFalling)
        .map((f) => f.xPercent);
      onFlowersChange(activePositions);
    }
  }, [flowers, onFlowersChange]);

  // Click handler to initiate flower fall and regrowth
  const handleFlowerClick = (flowerId: string, event: React.MouseEvent) => {
    const flower = flowers.find((f) => f.id === flowerId);
    if (!flower || flower.isFalling || !isActivated) return;

    const container = containerRef.current;
    if (!container) return;

    const parentWidth = container.clientWidth;
    const parentHeight = container.clientHeight;
    
    // Calculate click coordinates relative to container using client coordinates
    const rect = container.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    playSparkleSound(900, 2400, "triangle");
    (window as any).spawnGardenSparkles?.(clickX, clickY, flower.colorTheme, 14);

    setFlowers((prev) =>
      prev.map((f) => (f.id === flowerId ? { ...f, isFalling: true } : f))
    );

    const flowerHead = document.getElementById(`head-${flowerId}`);
    const flowerStem = document.getElementById(`stem-${flowerId}`);
    const flowerLeaf = document.getElementById(`leaves-${flowerId}`);
    const swayWrapper = document.getElementById(`sway-${flowerId}`);

    // Kill any active Wind sway or Entry tweens to prevent collision lag
    if (swayWrapper && flowerHead && flowerStem) {
      gsap.killTweensOf(swayWrapper);
      gsap.killTweensOf(flowerHead);
      gsap.killTweensOf(flowerStem);
      if (flowerLeaf) gsap.killTweensOf(flowerLeaf);

      const tl = gsap.timeline();
      const fallDistance = flower.height + 150; // Fall past the bottom edge of the screen

      // Calculate falling trajectory mathematically to avoid layout thrashing (getBoundingClientRect) on every frame
      const startX = (flower.xPercent / 100) * parentWidth;
      const baseOffset = flower.depthLayer === 0 ? 110 : flower.depthLayer === 1 ? 85 : 50;
      const startY = parentHeight - baseOffset - flower.height;

      // Animate the entire swayWrapper falling together (stem, leaves, and bloom intact)
      tl.to(swayWrapper, {
        y: fallDistance,
        rotation: (flower.stemCurve >= 0 ? 1 : -1) * (40 + Math.random() * 35), // Organic tilt
        opacity: 0,
        duration: 1.0, // Faster duration (was 1.3)
        ease: "power2.in",
        onUpdate: () => {
          // Spawn sparkles along the falling bloom's trail using purely mathematical calculations
          if (Math.random() < 0.25) {
            const currentY = (gsap.getProperty(swayWrapper, "y") as number) || 0;
            const progress = currentY / fallDistance;
            
            // Adjust X slightly based on rotation tilt
            const tiltOffset = (flower.stemCurve >= 0 ? 1 : -1) * 35 * progress;
            const trailX = startX + tiltOffset;
            const trailY = startY + currentY;

            (window as any).spawnGardenSparkles?.(trailX, trailY, flower.colorTheme, 1);
          }
        }
      });

      // Regrow after the whole flower finishes falling
      tl.add(() => {
        setTimeout(() => {
          regrowFlower(flowerId);
        }, 300); // Faster regrowth delay (was 400)
      });
    }
  };

  // Regrow flower logic
  const regrowFlower = (flowerId: string) => {
    const newType = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    const newColor = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
    
    // Maintain depth
    const curFl = flowers.find((f) => f.id === flowerId);
    const depth = curFl?.depthLayer ?? 1;

    let newHeight = 260;
    if (depth === 0) {
      newHeight = 170 + Math.floor(Math.random() * 60);
    } else if (depth === 1) {
      newHeight = 230 + Math.floor(Math.random() * 60);
    } else {
      newHeight = 280 + Math.floor(Math.random() * 70);
    }

    const newCurve = (Math.random() * 22) - 11;

    // Reset layout
    const flowerHead = document.getElementById(`head-${flowerId}`);
    const flowerStem = document.getElementById(`stem-${flowerId}`);
    const flowerLeaf = document.getElementById(`leaves-${flowerId}`);
    const swayWrapper = document.getElementById(`sway-${flowerId}`);

    // Instantly reset the swayWrapper's fall offsets before starting regrowth
    if (swayWrapper) gsap.set(swayWrapper, { y: 0, rotation: 0, opacity: 1 });
    if (flowerHead) gsap.set(flowerHead, { y: 0, rotation: 0, opacity: 0, scale: 0 });
    if (flowerStem) gsap.set(flowerStem, { scaleY: 0, opacity: 0 });
    if (flowerLeaf) gsap.set(flowerLeaf, { scale: 0, opacity: 0 });

    setFlowers((prev) =>
      prev.map((f) =>
        f.id === flowerId
          ? {
              ...f,
              type: newType,
              colorTheme: newColor,
              height: newHeight,
              stemCurve: newCurve,
              isFalling: false,
              growKey: f.growKey + 1
            }
          : f
      )
    );
  };

  // Trigger GSAP entry animations for active elements
  useEffect(() => {
    if (!isActivated) return;

    flowers.forEach((flower) => {
      if (flower.isFalling) return;

      // Skip if this version of the flower has already grown/animated
      if (hasGrownRef.current[flower.id] === flower.growKey) return;
      hasGrownRef.current[flower.id] = flower.growKey;

      const flowerHead = document.getElementById(`head-${flower.id}`);
      const flowerStem = document.getElementById(`stem-${flower.id}`);
      const flowerLeaf = document.getElementById(`leaves-${flower.id}`);

      if (flowerStem && flowerHead) {
        const delay = Math.random() * 0.4 + 0.05; // Fast growth delays

        // Grow stem
        gsap.to(flowerStem, {
          scaleY: 1,
          opacity: 1,
          transformOrigin: "bottom center",
          duration: 0.8, // Faster duration (was 1.5)
          delay: delay,
          ease: "power2.out",
          onStart: () => {
            playSparkleSound(440, 1100, "sine");
            if (containerRef.current) {
              const xPos = (flower.xPercent / 100) * containerRef.current.clientWidth;
              const baseOffset = flower.depthLayer === 0 ? 110 : flower.depthLayer === 1 ? 85 : 50;
              (window as any).spawnGardenSparkles?.(xPos, containerRef.current.clientHeight - baseOffset, flower.colorTheme, 6, true);
            }
          }
        });

        // Grow leaves
        if (flowerLeaf) {
          gsap.to(flowerLeaf, {
            scale: 1,
            opacity: 1,
            transformOrigin: "bottom center",
            duration: 0.6, // Faster duration (was 1.1)
            delay: delay + 0.2, // Faster delay
            ease: "back.out(1.4)"
          });
        }

        // Bloom flower head
        gsap.to(flowerHead, {
          scale: 1,
          opacity: 1,
          transformOrigin: "center center",
          duration: 0.7, // Faster duration (was 1.3)
          delay: delay + 0.3, // Faster delay
          ease: "back.out(1.6)",
          onComplete: () => {
            if (containerRef.current) {
              const xPos = (flower.xPercent / 100) * containerRef.current.clientWidth;
              const baseOffset = flower.depthLayer === 0 ? 110 : flower.depthLayer === 1 ? 85 : 50;
              const yPos = containerRef.current.clientHeight - baseOffset - flower.height;
              (window as any).spawnGardenSparkles?.(xPos, yPos, flower.colorTheme, 5);
            }
          }
        });
      }
    });
  }, [isActivated, flowers.map(f => f.id + "-" + f.growKey).join(",")]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
    >
      {/* Unified Canvas Particle Overlay (Sparkles and Dog Pee) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
      />

      {/* Flower Items Layer */}
      {isActivated &&
        flowers.map((fl) => {
          const stemControlX = 50 + fl.stemCurve;
          const stemEndX = 50 + fl.stemCurve * 1.5;
          const stemEndY = 300 - fl.height;

          // Align vertical Y anchor and style details according to depth layer
          const verticalAnchor = fl.depthLayer === 0 ? "110px" : fl.depthLayer === 1 ? "85px" : "50px";
          const scaleFactor = fl.depthLayer === 0 ? 0.65 : fl.depthLayer === 1 ? 0.95 : 1.25;
          const blurFactor = fl.depthLayer === 0 ? "blur(1px)" : "none";
          const opacityFactor = fl.depthLayer === 0 ? 0.7 : 1.0;
          const layerZIndex = fl.depthLayer === 0 ? 12 : fl.depthLayer === 1 ? 16 : 22;

          // Assign random GPU-accelerated CSS keyframe sways instead of active JS loops
          const swayClass = fl.isFalling 
            ? "" 
            : ["sway-slow-l", "sway-slow-r", "sway-mid-l", "sway-mid-r"][parseInt(fl.id.replace("fl-", "")) % 4];

          return (
            <div
              key={fl.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${fl.xPercent}%`,
                bottom: verticalAnchor,
                width: "100px",
                height: "300px",
                transform: `translateX(-50%) scale(${scaleFactor})`,
                opacity: opacityFactor,
                filter: blurFactor,
                zIndex: layerZIndex
              }}
            >
              {/* Sway Container (Runs GPU-accelerated CSS sway) */}
              <div
                id={`sway-${fl.id}`}
                className={`w-full h-full ${swayClass}`}
                style={{ transformOrigin: "bottom center" }}
              >
                <svg
                  viewBox="0 0 100 300"
                  width="100%"
                  height="100%"
                  className="overflow-visible"
                >
                  <defs>
                    <filter id={`glow-${fl.id}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. STEM */}
                  <path
                    id={`stem-${fl.id}`}
                    d={`M 50 300 Q ${stemControlX} 180, ${stemEndX} ${stemEndY}`}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="opacity-0"
                    style={{ transformOrigin: "bottom center" }}
                  />

                  {/* 2. LEAVES */}
                  <g id={`leaves-${fl.id}`} className="opacity-0">
                    <path
                      d={`M ${50 + fl.stemCurve * 0.5} 220 Q ${30 + fl.stemCurve * 0.5} 200, ${34 + fl.stemCurve * 0.5} 187 Q ${48 + fl.stemCurve * 0.5} 197, ${50 + fl.stemCurve * 0.5} 220`}
                      fill="#10b981"
                    />
                    <path
                      d={`M ${50 + fl.stemCurve * 0.8} 160 Q ${68 + fl.stemCurve * 0.8} 146, ${63 + fl.stemCurve * 0.8} 132 Q ${52 + fl.stemCurve * 0.8} 143, ${50 + fl.stemCurve * 0.8} 160`}
                      fill="#10b981"
                    />
                  </g>

                  {/* 3. FLOWER HEAD */}
                  <g
                    id={`head-${fl.id}`}
                    className="cursor-pointer opacity-0 scale-0"
                    style={{
                      transformOrigin: `${stemEndX}px ${stemEndY}px`
                    }}
                    onClick={(e) => handleFlowerClick(fl.id, e)}
                    role="button"
                    aria-label={`Bloom ${fl.type}`}
                  >
                    <circle
                      cx={stemEndX}
                      cy={stemEndY}
                      r="35"
                      fill="transparent"
                      className="cursor-pointer"
                    />

                    <g filter={`url(#glow-${fl.id})`}>
                      {fl.type === "rose" && (
                        <g>
                          <circle cx={stemEndX} cy={stemEndY - 14} r="14" fill={fl.colorTheme} opacity="0.85" />
                          <circle cx={stemEndX - 11} cy={stemEndY + 7} r="14" fill={fl.colorTheme} opacity="0.85" />
                          <circle cx={stemEndX + 11} cy={stemEndY + 7} r="14" fill={fl.colorTheme} opacity="0.85" />
                          <path
                            d={`M ${stemEndX - 9} ${stemEndY - 4} Q ${stemEndX} ${stemEndY - 14}, ${stemEndX + 9} ${stemEndY - 4} Q ${stemEndX} ${stemEndY + 4}, ${stemEndX - 9} ${stemEndY - 4}`}
                            fill={fl.colorTheme}
                          />
                          <path
                            d={`M ${stemEndX - 5} ${stemEndY - 2} Q ${stemEndX} ${stemEndY - 8}, ${stemEndX + 5} ${stemEndY - 2} Q ${stemEndX} ${stemEndY + 4}, ${stemEndX - 5} ${stemEndY - 2}`}
                            fill="#ffffff"
                            opacity="0.25"
                          />
                          <circle cx={stemEndX} cy={stemEndY} r="6" fill={fl.colorTheme} />
                          <circle cx={stemEndX} cy={stemEndY} r="3.2" fill="#fef08a" />
                        </g>
                      )}

                      {fl.type === "dahlia" && renderDahlia(stemEndX, stemEndY, fl.colorTheme)}
                      {fl.type === "daisy" && renderDaisy(stemEndX, stemEndY)}
                      {fl.type === "peony" && renderPeony(stemEndX, stemEndY, fl.colorTheme)}
                      {fl.type === "tulip" && renderTulip(stemEndX, stemEndY, fl.colorTheme)}
                      {fl.type === "orchid" && renderOrchid(stemEndX, stemEndY, fl.colorTheme)}
                      {fl.type === "lily_of_the_valley" && renderLilyOfTheValley(stemEndX, stemEndY)}
                      {fl.type === "sunflower" && renderSunflower(stemEndX, stemEndY)}
                      {fl.type === "calla_lily" && renderCallaLily(stemEndX, stemEndY)}
                      {fl.type === "lilac" && renderLilac(stemEndX, stemEndY)}
                      {fl.type === "zinnia" && renderZinnia(stemEndX, stemEndY, fl.colorTheme)}
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          );
        })}
    </div>
  );
}
