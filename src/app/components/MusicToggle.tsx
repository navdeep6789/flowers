"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  src: string;
  isActivated?: boolean;
}

export default function MusicToggle({ src, isActivated }: MusicToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Check localStorage for preference
    const savedPreference = localStorage.getItem("music_preference");
    if (savedPreference === "playing") {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.warn("Autoplay prevented:", e));
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [src]);

  useEffect(() => {
    if (isActivated && audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem("music_preference", "playing");
      }).catch(e => console.warn("Audio play error:", e));
    }
  }, [isActivated, isPlaying]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      localStorage.setItem("music_preference", "paused");
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        localStorage.setItem("music_preference", "playing");
        setIsPlaying(true);
      });
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-6 right-6 p-4 bg-slate-900/60 backdrop-blur-md rounded-full shadow-lg text-slate-300 hover:text-cyan-400 hover:scale-105 transition-all z-40 border border-slate-700/50"
      aria-label={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
    </button>
  );
}
