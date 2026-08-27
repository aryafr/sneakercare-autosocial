import React from "react";
import { Loader2, Waves } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-20 h-20 bg-sky-50 rounded-full animate-pulse border border-sky-100 flex items-center justify-center">
          <Waves className="w-8 h-8 text-sky-200 animate-pulse" />
        </div>
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-black text-slate-800">Harap Tunggu...</h3>
        <p className="text-xs text-slate-400 font-medium">
          Mempersiapkan halaman untuk Anda
        </p>
      </div>
    </div>
  );
}
