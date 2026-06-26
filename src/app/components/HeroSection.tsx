"use client";

import { useEffect, useState } from "react";
import BouquetAnimation from "./BouquetAnimation";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  animationSrc: string;
  onFlowerClick: (id: string) => void;
}

export default function HeroSection({ title, subtitle, animationSrc, onFlowerClick }: HeroSectionProps) {
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    // Show CTA after bloom sequence (approx 2.5s)
    const timer = setTimeout(() => setShowCta(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-8 overflow-hidden">
      <div className="flex-1 flex flex-col items-start z-10 space-y-6">
        <h1 className="text-5xl md:text-7xl font-serif text-gray-800 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <h2 className="text-xl md:text-2xl font-sans font-light text-gray-600">
            {subtitle}
          </h2>
        )}
        
        <div className={`transition-opacity duration-1000 ${showCta ? 'opacity-100' : 'opacity-0'}`}>
          <p className="mt-8 text-sm uppercase tracking-widest text-coral font-semibold">
            Touch a petal to open
          </p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg md:max-w-2xl">
        <BouquetAnimation src={animationSrc} onLayerClick={onFlowerClick} />
      </div>
    </section>
  );
}
