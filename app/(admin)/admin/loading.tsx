import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-sky-100 rounded-2xl animate-pulse"></div>
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center space-y-1.5">
        <h3 className="text-sm font-black text-slate-800">Memuat Data...</h3>
        <p className="text-xs text-slate-400 font-medium max-w-[250px]">
          Mensinkronisasi dengan database dan layanan pihak ketiga
        </p>
      </div>
    </div>
  );
}
