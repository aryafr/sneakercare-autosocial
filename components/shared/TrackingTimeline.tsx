import React from "react";
import { CheckCircle2, Circle, Clock, Sparkles, Wind, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingTimelineProps {
  currentStatus: string;
}

const STAGES = [
  {
    key: "RECEIVED",
    label: "Diterima",
    description: "Sepatu masuk antrean intake workshop",
    icon: Clock,
  },
  {
    key: "IN_PROGRESS",
    label: "Treatment",
    description: "Pembersihan mendalam sesuai paket",
    icon: Sparkles,
  },
  {
    key: "WASHED",
    label: "Pencucian Selesai",
    description: "Inspeksi kebersihan & detailing",
    icon: Wind,
  },
  {
    key: "DRYING",
    label: "Pengeringan",
    description: "Dehumidifikasi & ozon disinfeksi",
    icon: Wind,
  },
  {
    key: "READY",
    label: "Siap Diambil",
    description: "Quality control pass & siap diambil/dikirim",
    icon: PackageCheck,
  },
];

export function TrackingTimeline({ currentStatus }: TrackingTimelineProps) {
  const getStageIndex = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return 0;
      case "IN_PROGRESS":
        return 1;
      case "WASHED":
        return 2;
      case "DRYING":
        return 3;
      case "READY":
      case "COMPLETED":
        return 4;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStatus);

  if (currentStatus === "CANCELLED") {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-center font-medium">
        Pesanan ini telah dibatalkan.
      </div>
    );
  }

  return (
    <div className="relative py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        {/* Mobile vertical line */}
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 md:hidden" />
        
        {/* Desktop horizontal line */}
        <div className="hidden md:block absolute left-8 right-8 top-5 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex || (idx === STAGES.length - 1 && currentStatus === "COMPLETED");
          const isCurrent = idx === activeIndex && currentStatus !== "COMPLETED";
          const isPending = idx > activeIndex;

          const IconComponent = stage.icon;

          return (
            <div
              key={stage.key}
              className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 relative z-10 w-full md:w-auto"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 font-bold",
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20 shadow-lg shadow-primary/30 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col md:items-center text-left md:text-center">
                <span
                  className={cn(
                    "text-sm font-bold tracking-tight",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
                <span className="text-xs text-muted-foreground max-w-[130px] hidden md:block">
                  {stage.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
