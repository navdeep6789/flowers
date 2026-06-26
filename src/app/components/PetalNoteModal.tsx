"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface PetalNoteModalProps {
  open: boolean;
  note: string;
  onClose: () => void;
}

export default function PetalNoteModal({ open, note, onClose }: PetalNoteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Basic focus trap could go here, for now focus the close button
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-cream/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-coral transition-colors rounded-full hover:bg-cream"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        <p className="text-3xl font-script text-gray-800 leading-relaxed mt-4">
          {note}
        </p>
      </div>
    </div>
  );
}
