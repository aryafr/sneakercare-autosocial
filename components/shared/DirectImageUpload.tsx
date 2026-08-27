"use client";

import React, { useState, useRef } from "react";
import { getCloudinarySignedUploadParams } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { UploadCloud, Camera, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface DirectImageUploadProps {
  label: string;
  initialImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
}

export function DirectImageUpload({
  label,
  initialImageUrl,
  onImageUploaded,
}: DirectImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas 5MB.");
      return;
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get signed upload parameters from server
      const signedParams = await getCloudinarySignedUploadParams();

      if (signedParams.isMock) {
        // In local/demo mode, convert to local data URL
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setImageUrl(dataUrl);
          onImageUploaded(dataUrl);
          setIsUploading(false);
          toast.success(`${label} berhasil disimpan!`);
        };
        reader.readAsDataURL(file);
        return;
      }

      // 2. Direct upload to Cloudinary API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signedParams.apiKey);
      formData.append("timestamp", String(signedParams.timestamp));
      formData.append("signature", signedParams.signature);
      formData.append("folder", signedParams.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${signedParams.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        onImageUploaded(data.secure_url);
        toast.success(`${label} berhasil diunggah ke cloud!`);
      } else {
        throw new Error(data.error?.message || "Upload gagal");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wider text-slate-700">{label}</span>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="relative border-2 border-dashed border-sky-100 hover:border-sky-300 transition-colors rounded-3xl p-4 flex flex-col items-center justify-center bg-sky-50/20 min-h-[190px] overflow-hidden group">
        {imageUrl ? (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="300px"
            />
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-full shadow hover:bg-slate-100 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-sky-500" /> Foto Ulang
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-full shadow hover:bg-slate-800 flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Pilih File
              </button>
            </div>
            <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-2 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                <span className="text-xs font-bold text-slate-600">Mengunggah dokumentasi...</span>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Unggah Dokumentasi Workshop</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Format JPG, PNG, WebP (Maks. 5MB)</div>
                </div>

                {/* Operator Actions: Direct Camera & File Picker */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-400/25 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Kamera HP
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" /> Galeri / File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
