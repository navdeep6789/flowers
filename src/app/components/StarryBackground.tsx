"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  dx: number;
  dy: number;
  alpha: number;
  fadeSpeed: number;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let milkyWayStars: Star[] = [];
    let shootingStars: ShootingStar[] = [];

    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(254, 240, 138, ", // Gold/yellow
      "rgba(165, 243, 252, ", // Cyan/blue
      "rgba(224, 200, 254, "  // Lilac
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      milkyWayStars = [];
      
      // 1. General background stars (fewer, spread out)
      const starCount = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < starCount; i++) {
        const colorBase = starColors[Math.floor(Math.random() * starColors.length)];
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.7 + 0.1,
          twinkleSpeed: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
          color: colorBase
        });
      }

      // 2. Milky Way Stars (highly concentrated along a diagonal belt)
      // Ladakh night sky has a brilliant, visible Milky Way core.
      // Diagonal line from bottom-left to top-right
      const mwCount = Math.floor((canvas.width * canvas.height) / 3000); // Dense star cloud
      for (let i = 0; i < mwCount; i++) {
        const t = Math.random(); // Position along the belt (0 to 1)
        
        // Base point along diagonal
        const baseX = t * canvas.width;
        const baseY = (1 - t) * canvas.height * 0.85 + canvas.height * 0.08;
        
        // Perpendicular offset with cluster density in the center
        // Squaring the offset value pushes most stars close to the center line
        const r1 = Math.random() - 0.5;
        const r2 = Math.random() - 0.5;
        const spreadWidth = Math.min(canvas.width, canvas.height) * 0.35;
        const offset = r1 * r2 * r2 * 2 * spreadWidth;
        
        // Perpendicular unit vector to diagonal: (-dy, dx)
        // Diagonal vector: (width, -height*0.85)
        const dx = canvas.width;
        const dy = -canvas.height * 0.85;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;

        const starX = baseX + perpX * offset;
        const starY = baseY + perpY * offset;

        // Skip if outside canvas
        if (starX < 0 || starX > canvas.width || starY < 0 || starY > canvas.height) {
          continue;
        }

        const colorBase = starColors[Math.floor(Math.random() * starColors.length)];
        milkyWayStars.push({
          x: starX,
          y: starY,
          // Milky way stars are mostly tiny dust particles
          radius: Math.random() * 0.95 + 0.2,
          alpha: Math.random() * 0.85 + 0.15,
          twinkleSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          color: colorBase
        });
      }
    };

    const createShootingStar = () => {
      const startX = Math.random() * canvas.width * 0.7;
      const startY = Math.random() * canvas.height * 0.3;
      const angle = Math.PI / 6 + Math.random() * (Math.PI / 12); // Diagonal sweep
      const speed = Math.random() * 9 + 7;
      
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 100 + 50,
        speed: speed,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        alpha: 1.0,
        fadeSpeed: Math.random() * 0.025 + 0.018
      });
    };

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, "#02020a"); // Space pitch black
      bgGrad.addColorStop(0.5, "#060416"); // Ladakh high-altitude dark navy
      bgGrad.addColorStop(1, "#0d0a28"); // Soft horizon glow
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Milky Way galaxy nebulas (overlapping soft glowing circles along the diagonal)
      const beltPoints = [
        { t: 0.15, r: 0.22, color: "rgba(139, 92, 246, 0.08)" }, // Purple/Violet gas
        { t: 0.35, r: 0.28, color: "rgba(236, 72, 153, 0.06)" },  // Pink/magenta dust
        { t: 0.55, r: 0.32, color: "rgba(34, 211, 238, 0.06)" },  // Cyan/teal star-burst
        { t: 0.75, r: 0.26, color: "rgba(254, 240, 138, 0.04)" }  // Warm gold core
      ];

      beltPoints.forEach((pt) => {
        const x = pt.t * canvas.width;
        const y = (1 - pt.t) * canvas.height * 0.85 + canvas.height * 0.08;
        const radius = Math.min(canvas.width, canvas.height) * pt.r;
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, pt.color);
        grad.addColorStop(0.5, pt.color.replace("0.0", "0.03"));
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw background stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.max(0.1, star.alpha)})`;
        ctx.fill();
      }

      // 4. Draw Milky Way stars (twinkle slightly faster, creating a shimmering band)
      for (let i = 0; i < milkyWayStars.length; i++) {
        const star = milkyWayStars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1.0 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.max(0.15, star.alpha)})`;
        ctx.fill();
      }

      // 5. Spawn shooting stars
      if (Math.random() < 0.0022 && shootingStars.length < 2) {
        createShootingStar();
      }

      // 6. Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - ss.dx * 2.5,
          ss.y - ss.dy * 2.5
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.dx * 1.5, ss.y - ss.dy * 1.5);
        ctx.stroke();

        // Update positions
        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.alpha -= ss.fadeSpeed;

        if (ss.alpha <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    updateAndDraw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
