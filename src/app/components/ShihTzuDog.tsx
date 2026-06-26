"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ShihTzuProps {
  id: string;
  colorTheme?: "gold" | "gray" | "black";
  initialX?: number;
  groundY?: number;
  zIndex?: number;
  flowerXPercents?: number[]; // Active flower positions
}

export default function ShihTzuDog({
  id,
  colorTheme = "gold",
  initialX = -100,
  groundY = 120, // offset from bottom of viewport in pixels
  zIndex = 35,
  flowerXPercents = [],
}: ShihTzuProps) {
  const dogRef = useRef<HTMLDivElement>(null);

  // Cache the flower position array in a ref to avoid rebuilding dog GSAP behavior loops when a flower falls/regrows
  const flowerXPercentsRef = useRef(flowerXPercents);
  useEffect(() => {
    flowerXPercentsRef.current = flowerXPercents;
  }, [flowerXPercents]);
  
  // SVG element references for GSAP
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGPathElement>(null);
  const legFLRef = useRef<SVGRectElement>(null);
  const legFRRef = useRef<SVGRectElement>(null);
  const legBLRef = useRef<SVGRectElement>(null);
  const legBRRef = useRef<SVGRectElement>(null);
  const earLRef = useRef<SVGPathElement>(null);
  const earRRef = useRef<SVGPathElement>(null);

  // Theme Colors
  const colors = {
    gold: { patch: "#c2410c", light: "#fef3c7", bow: "#f43f5e", collar: "#ef4444" },  // Gold patch, cream, red bow, red collar
    gray: { patch: "#4b5563", light: "#f3f4f6", bow: "#3b82f6", collar: "#fbbf24" },  // Gray patch, light gray, blue bow, gold collar
    black: { patch: "#1f2937", light: "#e5e7eb", bow: "#a855f7", collar: "#10b981" }, // Charcoal, gray-white, purple bow, green collar
  }[colorTheme];

  // Peeing particles are managed globally in the garden canvas to bypass React rerender cycles

  const audioCtxRef = useRef<AudioContext | null>(null);

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

  // Synthesize a cute puppy bark (higher pitched, zippy sound)
  const playBark = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      // Sound 1: main bark impulse
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      
      // Higher frequencies for a cute puppy yip
      osc1.frequency.setValueAtTime(550, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Sound 2: quick double-bark echo
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        
        const now2 = ctx.currentTime;
        osc2.frequency.setValueAtTime(600, now2);
        osc2.frequency.exponentialRampToValueAtTime(1200, now2 + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(350, now2 + 0.10);
        
        gain2.gain.setValueAtTime(0.09, now2);
        gain2.gain.linearRampToValueAtTime(0.09, now2 + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.10);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.start(now2);
        osc2.stop(now2 + 0.11);
      }, 75); // Faster echo delay
    } catch (e) {}
  };

  useEffect(() => {
    const dog = dogRef.current;
    if (!dog) return;

    // Reset initial styles
    gsap.set(dog, { x: initialX, y: 0 });
    
    // Set transform origins for joint rotations
    gsap.set(legFLRef.current, { transformOrigin: "50% 10%" });
    gsap.set(legFRRef.current, { transformOrigin: "50% 10%" });
    gsap.set(legBLRef.current, { transformOrigin: "50% 10%" });
    gsap.set(legBRRef.current, { transformOrigin: "50% 10%" });
    gsap.set(tailRef.current, { transformOrigin: "5% 85%" });
    gsap.set(headRef.current, { transformOrigin: "50% 90%" });
    gsap.set(earLRef.current, { transformOrigin: "90% 10%" });
    gsap.set(earRRef.current, { transformOrigin: "10% 10%" });
    gsap.set(bodyRef.current, { transformOrigin: "50% 50%" });

    let isDestroyed = false;
    let mainTimeline: gsap.core.Timeline | null = null;
    let legsTimeline: gsap.core.Timeline | null = null;
    let tailTimeline: gsap.core.Timeline | null = null;

    // Helper: start continuous tail wagging
    const startWagging = (speed = 0.2, angle = 15) => {
      if (tailTimeline) tailTimeline.kill();
      tailTimeline = gsap.timeline({ repeat: -1, yoyo: true });
      tailTimeline.to(tailRef.current, {
        rotation: angle,
        duration: speed,
        ease: "sine.inOut"
      });
    };

    // Helper: stop tail wagging
    const stopWagging = () => {
      if (tailTimeline) tailTimeline.kill();
      gsap.to(tailRef.current, { rotation: 0, duration: 0.3 });
    };

    // Helper: animate running legs
    const startRunningLegs = (speed = 0.15) => {
      if (legsTimeline) legsTimeline.kill();
      legsTimeline = gsap.timeline({ repeat: -1 });
      
      legsTimeline
        .to([legFLRef.current, legBRRef.current], {
          rotation: -28,
          duration: speed,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut"
        }, 0)
        .to([legFRRef.current, legBLRef.current], {
          rotation: 28,
          duration: speed,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut"
        }, 0)
        .to(bodyRef.current, {
          y: -4,
          rotation: -2,
          duration: speed,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut"
        }, 0);
    };

    const stopRunningLegs = () => {
      if (legsTimeline) legsTimeline.kill();
      gsap.to([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current], {
        rotation: 0,
        duration: 0.2
      });
      gsap.to(bodyRef.current, { y: 0, rotation: 0, duration: 0.2 });
    };

    // Core state loop: sequence of behaviors
    const runBehaviorLoop = () => {
      if (isDestroyed) return;
      
      const width = window.innerWidth;
      let targetX = Math.random() * (width - 150) + 50; 
      let isTargetingFlower = false;

      // 55% chance to run to a flower and pee on its stem
      const activeXPercents = flowerXPercentsRef.current || [];
      if (activeXPercents.length > 0 && Math.random() < 0.55) {
        const randomFlowerXPercent = activeXPercents[Math.floor(Math.random() * activeXPercents.length)];
        const flowerXPixel = (randomFlowerXPercent / 100) * width;
        
        const currentX = gsap.getProperty(dog, "x") as number;
        const dir = flowerXPixel > currentX ? 1 : -1;
        
        // Stop the dog so its back leg (x ~ 28px) aligns directly with the flowerXPixel.
        // Facing Right (dir=1): Stop at flowerXPixel - 26px
        // Facing Left (dir=-1): Stop at flowerXPixel + 26px
        targetX = flowerXPixel - (dir * 26);
        isTargetingFlower = true;
      }

      const currentX = gsap.getProperty(dog, "x") as number;
      const direction = targetX > currentX ? 1 : -1;
      const distance = Math.abs(targetX - currentX);
      const runDuration = distance / (220 + Math.random() * 100); // Speed calculation (faster running)

      gsap.set(dog, { scaleX: direction });

      mainTimeline = gsap.timeline({
        onComplete: () => {
          if (isTargetingFlower) {
            // Arrived at the stem target, lift leg and pee directly on it!
            playPee();
          } else {
            // General action selection
            const decision = Math.random();
            if (decision < 0.28) {
              playJump();
            } else if (decision < 0.58) {
              playBarkWag();
            } else if (decision < 0.75) {
              playPee();
            } else {
              playSniff();
            }
          }
        }
      });

      // Start run action (faster running animations)
      startWagging(0.07, 24);
      startRunningLegs(0.07);

      mainTimeline.to(dog, {
        x: targetX,
        duration: runDuration,
        ease: "none"
      });
    };

    // Behavior: Peeing (lifts leg, squirts yellow droplets)
    const playPee = () => {
      if (isDestroyed) return;

      stopRunningLegs();
      stopWagging();

      const peeTl = gsap.timeline({
        onComplete: runBehaviorLoop
      });

      // We'll lift the back-left leg (legBLRef) by rotating it
      // And we tilt the body/head slightly to make it look realistic
      peeTl
        // 1. Lift leg and tilt body
        .to(legBLRef.current, { rotation: -65, duration: 0.35, ease: "power1.out" })
        .to(bodyRef.current, { rotation: 6, y: 1.5, duration: 0.35, ease: "power1.out" }, 0)
        // 2. Pee for 1.8 seconds (we'll start spawning particles using a timer)
        .add(() => {
          startPeeingParticles();
        })
        .delay(1.8)
        // 3. Put leg down, shake tail
        .to(legBLRef.current, { rotation: 0, duration: 0.3, ease: "power1.in" })
        .to(bodyRef.current, { rotation: 0, y: 0, duration: 0.3, ease: "power1.in" }, "-=0.3")
        .add(() => {
          // Quick tail shake at the end
          startWagging(0.06, 25);
        })
        .to(tailRef.current, { rotation: 0, duration: 0.4 })
        .add(() => {
          stopWagging();
        });
    };

    const startPeeingParticles = () => {
      let count = 0;
      const interval = setInterval(() => {
        if (isDestroyed || count > 24) {
          clearInterval(interval);
          return;
        }
        
        if (dog) {
          const scaleX = (gsap.getProperty(dog, "scaleX") as number) || 1;
          const dogX = (gsap.getProperty(dog, "x") as number) || 0;
          const X = dogX + (scaleX === -1 ? 62 : 28);
          const Y = window.innerHeight - groundY - 24;
          (window as any).spawnGardenPee?.(X, Y, scaleX === 1);
        }
        
        count++;
      }, 65);
    };

    // Behavior: Happy Jump
    const playJump = () => {
      if (isDestroyed) return;
      
      stopRunningLegs();
      startWagging(0.08, 30);
      
      const jumpHeight = -90 - Math.random() * 50;
      const jumpDuration = 0.55;
      
      playBark();

      const jumpTl = gsap.timeline({
        onComplete: runBehaviorLoop
      });

      const scaleXSign = gsap.getProperty(dog, "scaleX") as number;
      const jumpForward = scaleXSign * (50 + Math.random() * 40);

      jumpTl
        .to(bodyRef.current, { scaleY: 0.78, y: 5, duration: 0.12, ease: "power1.out" })
        .to(bodyRef.current, { scaleY: 1.1, y: -2, duration: 0.1 })
        .to(dog, {
          y: jumpHeight,
          x: `+=${jumpForward}`,
          duration: jumpDuration * 0.5,
          ease: "power2.out"
        }, "-=0.1")
        .to([legFLRef.current, legFRRef.current], { rotation: -40, duration: jumpDuration * 0.25 }, "-=0.3")
        .to([legBLRef.current, legBRRef.current], { rotation: 40, duration: jumpDuration * 0.25 }, "-=0.3")
        .to([earLRef.current, earRRef.current], { y: -3, rotation: (idx) => (idx === 0 ? -15 : 15), duration: 0.15 }, "-=0.3")
        
        .to(dog, {
          y: 0,
          duration: jumpDuration * 0.5,
          ease: "power2.in"
        })
        .to([legFLRef.current, legFRRef.current, legBLRef.current, legBRRef.current], { rotation: 0, duration: 0.18 }, "-=0.15")
        .to([earLRef.current, earRRef.current], { y: 0, rotation: 0, duration: 0.2 }, "-=0.15")
        
        .to(bodyRef.current, { scaleY: 0.75, y: 6, duration: 0.08, ease: "power1.in" })
        .to(bodyRef.current, { scaleY: 1, y: 0, duration: 0.15, ease: "back.out(1.7)" });
    };

    // Behavior: Sniff/Idle around
    const playSniff = () => {
      if (isDestroyed) return;
      
      stopRunningLegs();
      startWagging(0.3, 10);

      const sniffTl = gsap.timeline({
        onComplete: runBehaviorLoop
      });

      sniffTl
        .to(headRef.current, { rotation: 12, y: 5, duration: 0.4, ease: "power1.inOut" })
        .to(headRef.current, { rotation: -8, y: 6, duration: 0.3, ease: "power1.inOut", repeat: 3, yoyo: true })
        .to(headRef.current, { rotation: 0, y: 0, duration: 0.3 });
    };

    // Behavior: Happy Barking and Tail Wagging
    const playBarkWag = () => {
      if (isDestroyed) return;

      stopRunningLegs();
      startWagging(0.08, 35);

      const barkTl = gsap.timeline({
        onComplete: runBehaviorLoop
      });

      setTimeout(() => {
        if (!isDestroyed) playBark();
      }, 200);

      barkTl
        .to(bodyRef.current, { y: 2, scaleY: 0.95, duration: 0.2 })
        .to(headRef.current, { rotation: -18, y: -4, duration: 0.15, ease: "power2.out" }, "+=0.1")
        .to(headRef.current, { rotation: 0, y: 0, duration: 0.15 })
        
        .to(headRef.current, { rotation: -18, y: -4, duration: 0.15, ease: "power2.out" }, "+=0.1")
        .to(headRef.current, { rotation: 0, y: 0, duration: 0.15 })
        
        .to(bodyRef.current, { y: 0, scaleY: 1, duration: 0.2 })
        .delay(0.6);
    };

    const startTimeout = setTimeout(runBehaviorLoop, Math.random() * 1200);

    const handleClick = () => {
      if (mainTimeline) mainTimeline.kill();
      playJump();
    };

    const dogEl = dogRef.current;
    if (dogEl) {
      dogEl.addEventListener("click", handleClick);
    }

    return () => {
      isDestroyed = true;
      clearTimeout(startTimeout);
      if (mainTimeline) mainTimeline.kill();
      if (legsTimeline) legsTimeline.kill();
      if (tailTimeline) tailTimeline.kill();
      if (dogEl) dogEl.removeEventListener("click", handleClick);
    };
  }, [initialX]);

  return (
    <div
      ref={dogRef}
      id={id}
      className="absolute cursor-pointer select-none transition-transform"
      style={{
        bottom: `${groundY}px`,
        width: "90px",
        height: "80px",
        left: "0",
        zIndex: zIndex,
      }}
    >
      <svg
        viewBox="0 0 100 80"
        width="100%"
        height="100%"
        className="overflow-visible filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
      >
        {/* Soft Shadow Underneath */}
        <ellipse cx="48" cy="74" rx="26" ry="5" fill="rgba(0,0,0,0.3)" />

        {/* Legs Group */}
        <g id="legs">
          {/* Back Right Leg */}
          <rect
            ref={legBRRef}
            x="24"
            y="52"
            width="8"
            height="18"
            rx="4"
            fill={colors.light}
          />
          {/* Back Left Leg */}
          <rect
            ref={legBLRef}
            x="36"
            y="52"
            width="8"
            height="18"
            rx="4"
            fill={colors.patch}
          />
          {/* Front Right Leg */}
          <rect
            ref={legFRRef}
            x="54"
            y="52"
            width="8"
            height="18"
            rx="4"
            fill={colors.light}
          />
          {/* Front Left Leg */}
          <rect
            ref={legFLRef}
            x="64"
            y="52"
            width="8"
            height="18"
            rx="4"
            fill={colors.patch}
          />
        </g>

        {/* Fluffy Tail */}
        <path
          ref={tailRef}
          d="M 20 44 C 10 40, 4 20, 16 12 C 23 7, 30 15, 23 26"
          fill="none"
          stroke={colors.light}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Tail Fluff Patch */}
        <circle cx="12" cy="17" r="7" fill={colors.patch} />

        {/* Dog Body Group */}
        <g ref={bodyRef} id="body">
          {/* Main Body Fluff Base */}
          <ellipse cx="45" cy="42" rx="24" ry="17" fill={colors.light} />
          {/* Fluffy patches */}
          <path
            d="M 30 28 C 38 28, 42 36, 32 48 C 24 52, 22 36, 30 28 Z"
            fill={colors.patch}
          />
          <path
            d="M 48 30 C 58 28, 62 44, 52 54 C 44 54, 42 36, 48 30 Z"
            fill={colors.patch}
          />
          
          {/* Chest Fluff Ruffle (White Bib) */}
          <path
            d="M 52 39 C 48 48, 62 53, 63 43 Z"
            fill="#ffffff"
          />
          
          {/* Fluff details */}
          <circle cx="34" cy="30" r="5" fill={colors.light} />
          <circle cx="56" cy="46" r="6" fill={colors.light} />
          <circle cx="28" cy="46" r="5" fill={colors.light} />
          
          {/* Cute Collar and Gold Bell */}
          <path
            d="M 50 37 Q 58 41, 66 37"
            fill="none"
            stroke={colors.collar}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="58" cy="41" r="2.2" fill="#fbbf24" />
          <circle cx="58" cy="41" r="0.8" fill="#d97706" />
        </g>

        {/* Dog Head Group */}
        <g ref={headRef} id="head">
          {/* Floppy Left Ear */}
          <path
            ref={earLRef}
            d="M 52 20 C 44 22, 40 38, 46 48 C 49 52, 53 44, 54 30"
            fill={colors.patch}
          />
          
          {/* Floppy Right Ear */}
          <path
            ref={earRRef}
            d="M 78 20 C 86 22, 90 38, 84 48 C 81 52, 77 44, 76 30"
            fill={colors.patch}
          />

          {/* Head Base Fluff */}
          <circle cx="65" cy="28" r="16" fill={colors.light} />
          
          {/* Fluffy cheeks fur overlay */}
          <ellipse cx="53" cy="33" rx="5" ry="6.5" fill={colors.light} />
          <ellipse cx="77" cy="33" rx="5" ry="6.5" fill={colors.light} />

          {/* Face patches */}
          <path
            d="M 52 24 C 50 16, 62 16, 60 26 C 58 32, 54 30, 52 24 Z"
            fill={colors.patch}
          />
          <path
            d="M 78 24 C 80 16, 68 16, 70 26 C 72 32, 76 30, 78 24 Z"
            fill={colors.patch}
          />

          {/* Large Shiny Dark Eyes */}
          <circle cx="58" cy="24" r="3.5" fill="#111827" />
          <circle cx="59.5" cy="22.5" r="1" fill="#ffffff" />
          
          <circle cx="72" cy="24" r="3.5" fill="#111827" />
          <circle cx="70.5" cy="22.5" r="1" fill="#ffffff" />

          {/* Fluffy Muzzle / Mustache */}
          <ellipse cx="65" cy="32" rx="7.5" ry="5.5" fill="#ffffff" />
          <ellipse cx="61" cy="34" rx="4" ry="4" fill="#ffffff" />
          <ellipse cx="69" cy="34" rx="4" ry="4" fill="#ffffff" />

          {/* Nose */}
          <path
            d="M 63 29.5 L 67 29.5 L 65 31.5 Z"
            fill="#111827"
            stroke="#111827"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Small tongue */}
          <path
            d="M 64.5 35 C 64.5 37, 65.5 37, 65.5 35 Z"
            fill="#f43f5e"
            stroke="#e11d48"
            strokeWidth="0.5"
          />

          {/* Bow */}
          <g id="bow">
            <circle cx="65" cy="11" r="2.5" fill={colors.bow} />
            <path d="M 65 11 C 60 6, 58 12, 65 11" fill={colors.bow} />
            <path d="M 65 11 C 70 6, 72 12, 65 11" fill={colors.bow} />
          </g>
        </g>
      </svg>

      {/* Pee Drops are rendered in the global canvas overlay */}
    </div>
  );
}
