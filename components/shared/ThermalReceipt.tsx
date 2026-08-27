"use client";

import React, { useState } from "react";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, X, CheckCircle2, ShieldCheck, Waves } from "lucide-react";

interface ThermalReceiptProps {
  order: {
    id: string;
    trackingCode: string;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    deliveryAddress?: string | null;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: Date;
    items?: Array<{
      id: string;
      shoeBrand: string;
      shoeModel: string;
      shoeColor?: string | null;
      serviceName?: string | null;
      specialNotes?: string | null;
      price: number;
    }>;
  };
  triggerLabel?: string;
}

export function ThermalReceipt({ order, triggerLabel = "Cetak Struk Thermal" }: ThermalReceiptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("58mm");

  const handlePrint = () => {
    window.print();
  };

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track/${order.trackingCode}`
    : `http://localhost:3000/track/${order.trackingCode}`;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-full text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
      >
        <Printer className="w-3.5 h-3.5 text-sky-500" />
        <span>{triggerLabel}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-sky-100">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-500" />
                <h3 className="font-black text-slate-900 text-base">Pratinjau Struk Kasir Workshop</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Paper width toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setPaperWidth("58mm")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      paperWidth === "58mm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    58mm
                  </button>
                  <button
                    onClick={() => setPaperWidth("80mm")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      paperWidth === "80mm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    80mm
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div className="flex justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-x-auto print:bg-white print:p-0 print:border-none">
              <div
                id="thermal-receipt-content"
                className={`bg-white p-5 border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 leading-tight space-y-3 print:border-none print:p-0 print:text-black ${
                  paperWidth === "58mm" ? "w-[280px]" : "w-[360px]"
                }`}
              >
                {/* Workshop Header */}
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
                  <div className="font-black text-base tracking-tighter">SO CLEAN WORKSHOP</div>
                  <div className="text-[10px] text-slate-500">Premium Sneaker Care & Restoration</div>
                  <div className="text-[9px] text-slate-400">Jl. Senopati Raya No. 45, Jakarta Selatan</div>
                  <div className="text-[9px] text-slate-400">WhatsApp: +62 812-3456-7890</div>
                </div>

                {/* Resi & Order Details */}
                <div className="space-y-1 py-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>No. Resi:</span>
                    <span className="font-bold">{order.trackingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="font-bold">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Telepon:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layanan:</span>
                    <span className="font-bold">{order.serviceType === "DROP_OFF" ? "Drop-Off Toko" : "Pickup & Delivery"}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2">
                  <div className="font-bold text-[10px] uppercase">Rincian Sepatu:</div>
                  {order.items?.map((item, idx) => (
                    <div key={item.id || idx} className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>{idx + 1}. {item.shoeBrand} {item.shoeModel}</span>
                        <span>{formatRupiah(item.price)}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 pl-3">
                        Treatment: {item.serviceName || "Deep Clean"}
                        {item.specialNotes && (
                          <div className="italic text-slate-400">Note: {item.specialNotes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Status */}
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL:</span>
                    <span className="text-sm">{formatRupiah(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>STATUS BAYAR:</span>
                    <span className="font-bold uppercase">
                      {order.paymentStatus === "PAID" ? "✓ LUNAS" : "BELUM LUNAS"}
                    </span>
                  </div>
                </div>

                {/* QR Code Section for Online Tracking */}
                <div className="text-center pt-2 pb-1 border-t border-dashed border-slate-300 space-y-1">
                  <div className="w-24 h-24 mx-auto bg-slate-100 p-1.5 rounded-lg flex items-center justify-center border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        trackingUrl
                      )}`}
                      alt="QR Tracking"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[8px] text-slate-400">Scan QR Code untuk Lacak Status Real-Time</div>
                </div>

                {/* Footer Notes */}
                <div className="text-center text-[8px] text-slate-400 pt-1 space-y-0.5 border-t border-dashed border-slate-300">
                  <div>* Simpan struk ini sebagai bukti pengambilan sepatu</div>
                  <div>* Sepatu yang tidak diambil &gt; 30 hari di luar tanggung jawab toko</div>
                  <div className="font-bold pt-1">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-full text-xs font-bold"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-sky-400/25 px-6"
              >
                <Printer className="w-4 h-4" /> Cetak Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
