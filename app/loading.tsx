import React from "react";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );
}
