"use client";

import { useState, useEffect } from "react";
import StarryBackground from "./components/StarryBackground";
import InteractiveGarden from "./components/InteractiveGarden";
import ShihTzuDog from "./components/ShihTzuDog";
import MusicToggle from "./components/MusicToggle";

export default function Home() {
  const [isActivated, setIsActivated] = useState(false);
  const [flowerPositions, setFlowerPositions] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#03030d] overflow-hidden flex flex-col items-center justify-between text-slate-100 font-sans select-none">
      {/* Starry Night Sky Canvas */}
      <StarryBackground />

      {/* Floating Fireflies Layer (50 Fireflies) */}
      {isActivated && (
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => {
            const delay = i * 0.45;
            const left = Math.random() * 96;
            const size = Math.random() * 3.5 + 1.5;
            const duration = Math.random() * 6 + 6;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-yellow-200 opacity-0 filter blur-[0.8px]"
                style={{
                  left: `${left}%`,
                  bottom: "-5%",
                  width: `${size}px`,
                  height: `${size}px`,
                  boxShadow: "0 0 10px #fef08a, 0 0 20px #fef08a",
                  animation: `floatUp ${duration}s infinite linear`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main Interactive Garden Space */}
      <InteractiveGarden isActivated={isActivated} onFlowersChange={setFlowerPositions} />

      {/* Starting Overlay containing only a large, glowing glassmorphic "Hit It!" button */}
      {!isActivated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <button
            onClick={() => setIsActivated(true)}
            className="px-10 py-5 rounded-full border border-cyan-400/40 bg-black/40 text-cyan-200 text-2xl font-bold uppercase tracking-wider backdrop-blur-md glow-button transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          >
            Hit It!
          </button>
        </div>
      )}

      {/* Animated Shih Tzu Dogs (6 on Desktop, 3 on Mobile) */}
      {isActivated && (
        <>
          {/* Max - Gold theme, groundY 90 */}
          <ShihTzuDog id="dog-max" colorTheme="gold" initialX={-150} groundY={90} zIndex={18} flowerXPercents={flowerPositions} />
          {/* Rocky - Gray theme, groundY 115 */}
          <ShihTzuDog id="dog-rocky" colorTheme="gray" initialX={-300} groundY={115} zIndex={14} flowerXPercents={flowerPositions} />
          {/* Coco - Black theme, groundY 70 */}
          <ShihTzuDog id="dog-coco" colorTheme="black" initialX={-450} groundY={70} zIndex={19} flowerXPercents={flowerPositions} />
          
          {!isMobile && (
            <>
              {/* Buster - Gold theme, groundY 95 */}
              <ShihTzuDog id="dog-buster" colorTheme="gold" initialX={-600} groundY={95} zIndex={17} flowerXPercents={flowerPositions} />
              {/* Shadow - Gray theme, groundY 110 */}
              <ShihTzuDog id="dog-shadow" colorTheme="gray" initialX={-750} groundY={110} zIndex={15} flowerXPercents={flowerPositions} />
              {/* Bella - Black theme, groundY 80 */}
              <ShihTzuDog id="dog-bella" colorTheme="black" initialX={-900} groundY={80} zIndex={18} flowerXPercents={flowerPositions} />
            </>
          )}
        </>
      )}

      {/* Sparkling Winding River (Winds between Mountains and Midground Flowers) */}
      {isActivated && (
        <div className="absolute bottom-0 left-0 w-full h-[150px] pointer-events-none select-none z-13">
          <svg
            viewBox="0 0 1440 150"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#082f49" />
                <stop offset="40%" stopColor="#0369a1" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="60%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            {/* River bed */}
            <path
              d="M -50 110 C 350 80, 720 125, 1490 95 L 1490 150 L -50 150 Z"
              fill="url(#riverGrad)"
              opacity="0.9"
            />
            {/* Sparkles stream dashes */}
            <path
              d="M -50 110 C 350 80, 720 125, 1490 95"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2.5"
              strokeDasharray="20 40"
              className="animate-riverFlow"
              opacity="0.75"
            />
            <path
              d="M -50 113 C 350 83, 720 128, 1490 98"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="10 50"
              className="animate-riverFlow"
              style={{ animationDelay: "-1.5s" }}
              opacity="0.65"
            />
            <path
              d="M -50 117 C 350 87, 720 132, 1490 102"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="15 60"
              className="animate-riverFlow"
              style={{ animationDelay: "-0.7s" }}
              opacity="0.7"
            />
          </svg>
        </div>
      )}

      {/* Bottom Ground Landscape and Taller Silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-[150px] pointer-events-none z-20 select-none">
        <svg
          viewBox="0 0 1440 150"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="fill-[#02020a] overflow-visible"
        >
          {/* Distant majestic Himalayan peaks (Ladakh style, much taller) */}
          <path d="M 0 105 L 110 40 L 230 85 L 340 25 L 465 72 L 590 10 L 720 72 L 860 40 L 990 85 L 1120 15 L 1260 72 L 1440 32 L 1440 150 L 0 150 Z" opacity="0.45" fill="#040416" />
          {/* Closer rugged mountain range */}
          <path d="M 0 122 L 150 80 L 290 108 L 420 72 L 560 99 L 680 65 L 810 105 L 950 80 L 1090 110 L 1220 68 L 1350 99 L 1440 75 L 1440 150 L 0 150 Z" />
          
          {/* Stylized grass blades sticking up along the hill */}
          {Array.from({ length: 40 }).map((_, idx) => {
            const x = (idx * 37) + Math.random() * 15;
            const h = Math.random() * 18 + 12;
            return (
              <path
                key={idx}
                d={`M ${x} 135 Q ${x - 5} ${135 - h / 2}, ${x - 2} ${135 - h} Q ${x + 2} ${135 - h / 2}, ${x + 4} 135`}
                fill="#059669"
                opacity="0.35"
              />
            );
          })}
        </svg>
      </div>

      {/* Music Playback Option */}
      <MusicToggle src="/assets/music.mp3" isActivated={isActivated} />

      {/* Global CSS Inject for Fireflies float animation */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80vh) translateX(45px) scale(0.6);
            opacity: 0;
          }
        }
        
        .glow-button {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }
        .glow-button:hover {
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.7);
        }

        @keyframes riverFlow {
          from {
            stroke-dashoffset: 160;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-riverFlow {
          animation: riverFlow 5s linear infinite;
        }

        /* Flower organic sway animations */
        @keyframes swaySlowL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
        @keyframes swaySlowR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes swayMidL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes swayMidR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }

        .sway-slow-l {
          animation: swaySlowL 7s ease-in-out infinite;
        }
        .sway-slow-r {
          animation: swaySlowR 6.5s ease-in-out infinite;
        }
        .sway-mid-l {
          animation: swayMidL 5.5s ease-in-out infinite;
        }
        .sway-mid-r {
          animation: swayMidR 5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
