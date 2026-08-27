import React from "react";
import { cn } from "@/lib/utils";

interface ScribbleArrowProps {
  className?: string;
  flip?: boolean;
}

export function ScribbleArrow({ className, flip = false }: ScribbleArrowProps) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-14 h-6 text-sky-400 stroke-current", flip && "-scale-x-100", className)}
    >
      <path
        d="M5 25C25 8 55 5 85 20M85 20L72 12M85 20L76 28"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FloatingNoteProps {
  children: React.ReactNode;
  tilt?: "left" | "right" | "none";
  className?: string;
}

export function FloatingNote({ children, tilt = "right", className }: FloatingNoteProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-sky-100 shadow-[0_4px_20px_rgba(0,194,255,0.12)] text-[11px] font-semibold text-slate-700 backdrop-blur-sm transition-transform hover:scale-105",
        tilt === "left" && "-rotate-2",
        tilt === "right" && "rotate-2",
        className
      )}
    >
      {children}
    </div>
  );
}
