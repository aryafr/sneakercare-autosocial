"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { type Service } from "@/db/schema";
import { createOrder } from "@/actions/orders";
import { type CreateOrderInput } from "@/lib/validations";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  CreditCard,
  QrCode,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface BookingFormProps {
  initialServices: Service[];
  defaultServiceId?: string;
}

interface FormShoeItem {
  serviceId: string;
  shoeBrand: string;
  shoeModel: string;
  shoeColor: string;
  specialNotes: string;
  isExpress: boolean;
  basePrice: number;
}

export function BookingForm({ initialServices, defaultServiceId }: BookingFormProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [serviceType, setServiceType] = useState<"DROP_OFF" | "PICKUP_DELIVERY">("DROP_OFF");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  const [items, setItems] = useState<FormShoeItem[]>([
    {
      serviceId: defaultServiceId || initialServices[0]?.id || "serv_deep_clean",
      shoeBrand: "",
      shoeModel: "",
      shoeColor: "",
      specialNotes: "",
      isExpress: false,
      basePrice: initialServices.find((s) => s.id === (defaultServiceId || initialServices[0]?.id))?.basePrice || 50000,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add more shoes
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        serviceId: initialServices[0]?.id || "serv_deep_clean",
        shoeBrand: "",
        shoeModel: "",
        shoeColor: "",
        specialNotes: "",
        isExpress: false,
        basePrice: initialServices[0]?.basePrice || 50000,
      },
    ]);
  };

  // Remove shoe item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item field
  const handleUpdateItem = (index: number, fields: Partial<FormShoeItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...fields };

    // If service changed, update base price
    if (fields.serviceId) {
      const selectedService = initialServices.find((s) => s.id === fields.serviceId);
      if (selectedService) {
        updated[index].basePrice = selectedService.basePrice;
      }
    }

    setItems(updated);
  };

  // Calculate Subtotal & Total
  const calculateItemPrice = (item: FormShoeItem) => {
    return item.isExpress ? item.basePrice * 1.5 : item.basePrice;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const deliveryFee = serviceType === "PICKUP_DELIVERY" ? 20000 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      toast.error("Mohon lengkapi Nama Lengkap dan Nomor WhatsApp.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].shoeBrand || !items[i].shoeModel) {
        toast.error(`Mohon lengkapi Brand dan Model sepatu pada Pasang #${i + 1}.`);
        return;
      }
    }

    if (serviceType === "PICKUP_DELIVERY" && !deliveryAddress) {
      toast.error("Mohon isi Alamat Penjemputan / Pengantaran.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateOrderInput = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        serviceType,
        deliveryAddress: serviceType === "PICKUP_DELIVERY" ? deliveryAddress : undefined,
        paymentMethod,
        items: items.map((item) => ({
          itemType: "SERVICE" as const,
          quantity: 1,
          serviceId: item.serviceId,
          shoeBrand: item.shoeBrand,
          shoeModel: item.shoeModel,
          shoeColor: item.shoeColor || undefined,
          specialNotes: item.specialNotes || (item.isExpress ? "Pengerjaan EXPRESS (1 Hari)" : undefined),
          price: calculateItemPrice(item),
        })),
      };

      const result = await createOrder(payload);

      if (result.success && result.trackingCode) {
        toast.success("Pesanan berhasil dibuat!");
        router.push(`/track/${result.trackingCode}?new=true`);
      } else {
        throw new Error(result.error || "Gagal memproses pesanan");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Columns: Forms */}
      <div className="lg:col-span-8 space-y-8">
        {/* Step 1: Customer Info */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span className="w-8 h-8 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-sm">
              01
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">Informasi Pelanggan</h3>
              <p className="text-xs text-slate-400">Data untuk konfirmasi pemesanan dan pengiriman nomor resi pelacakan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap *</label>
              <Input
                required
                placeholder="Contoh: Raditya Dika"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-2xl border-slate-200 focus:border-sky-400 focus:ring-sky-400 h-11 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">No. WhatsApp *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold font-mono">
                  +62
                </span>
                <Input
                  required
                  type="tel"
                  className="rounded-l-none rounded-r-2xl border-slate-200 focus:border-sky-400 focus:ring-sky-400 h-11 text-sm font-medium"
                  placeholder="8123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email (Opsional)</label>
            <Input
              type="email"
              placeholder="nama@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="rounded-2xl border-slate-200 focus:border-sky-400 focus:ring-sky-400 h-11 text-sm font-medium"
            />
          </div>
        </div>

        {/* Step 2: Shoes & Treatments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-sm">
                02
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">Detail Sepatu & Pilihan Treatment</h3>
                <p className="text-xs text-slate-400">Pilih treatment khusus dan lengkapi spesifikasi tiap pasang sepatu.</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="gap-1.5 font-bold rounded-full border-sky-200 text-sky-600 hover:bg-sky-50"
            >
              <Plus className="w-4 h-4" /> Tambah Sepatu
            </Button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] overflow-hidden"
            >
              <div className="bg-sky-50/50 px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                <span className="text-xs font-black font-mono tracking-wider text-sky-700 uppercase">
                  Sepatu #{idx + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 hover:bg-red-50 h-8 px-2.5 text-xs font-semibold rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                  </Button>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                {/* Service Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Paket Treatment *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {initialServices.map((service) => {
                      const isSelected = item.serviceId === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleUpdateItem(idx, { serviceId: service.id })}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-sky-400 bg-sky-50/50 shadow-sm"
                              : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900">{service.name}</span>
                            <span className="text-sky-600 font-mono font-black text-xs">
                              {formatRupiah(service.basePrice)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-sky-500" />
                            <span>Est: {service.estimatedDays} hari kerja</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shoe Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Brand Sepatu *</label>
                    <Input
                      required
                      placeholder="Nike, Adidas, Jordan..."
                      value={item.shoeBrand}
                      onChange={(e) => handleUpdateItem(idx, { shoeBrand: e.target.value })}
                      className="rounded-2xl border-slate-200 h-10 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Model / Seri *</label>
                    <Input
                      required
                      placeholder="Air Jordan 1, Samba..."
                      value={item.shoeModel}
                      onChange={(e) => handleUpdateItem(idx, { shoeModel: e.target.value })}
                      className="rounded-2xl border-slate-200 h-10 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Warna Sepatu</label>
                    <Input
                      placeholder="White / Blue..."
                      value={item.shoeColor}
                      onChange={(e) => handleUpdateItem(idx, { shoeColor: e.target.value })}
                      className="rounded-2xl border-slate-200 h-10 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Special Notes & Express Toggle */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Catatan Kondisi Khusus</label>
                    <Textarea
                      rows={2}
                      placeholder="Contoh: Noda minyak di outsole kiri, harap hati-hati pada logo..."
                      value={item.specialNotes}
                      onChange={(e) => handleUpdateItem(idx, { specialNotes: e.target.value })}
                      className="rounded-2xl border-slate-200 text-xs font-medium resize-none"
                    />
                  </div>

                  {/* Express Turnaround Option */}
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.isExpress}
                      onChange={(e) => handleUpdateItem(idx, { isExpress: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 block">Pengerjaan Express Prioritas (1 Hari Kerja)</span>
                      <span className="text-slate-500 block">
                        Masuk antrean pengerjaan utama (+50% dari harga dasar treatment)
                      </span>
                    </div>
                    <Badge variant="warning" className="font-mono text-xs rounded-full">
                      +50%
                    </Badge>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Step 3: Logistics */}
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_10px_35px_rgba(0,194,255,0.06)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span className="w-8 h-8 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-sm">
              03
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">Metode Pengiriman / Penyerahan</h3>
              <p className="text-xs text-slate-400">Pilih opsi serah terima sepatu ke workshop.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setServiceType("DROP_OFF")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                serviceType === "DROP_OFF"
                  ? "border-sky-400 bg-sky-50/40 shadow-sm"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Drop-Off di Workshop</div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Antar & ambil langsung ke workshop kami. Tanpa biaya ongkir.
                </p>
              </div>
            </div>

            <div
              onClick={() => setServiceType("PICKUP_DELIVERY")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                serviceType === "PICKUP_DELIVERY"
                  ? "border-sky-400 bg-sky-50/40 shadow-sm"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Pickup & Delivery (+Rp 20.000)</div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Kurir kami menjemput dan mengantar kembali sepatu ke alamat Anda.
                </p>
              </div>
            </div>
          </div>

          {serviceType === "PICKUP_DELIVERY" && (
            <div className="space-y-1.5 pt-2 animate-in fade-in">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alamat Lengkap Penjemputan *
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Nama jalan, nomor rumah/kantor, patokan alamat, kecamatan & kota..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="rounded-2xl border-slate-200 text-xs font-medium resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right 4 Columns: Sticky Order Summary & Payment */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl bg-white border border-sky-100 shadow-[0_15px_45px_rgba(0,194,255,0.08)] sticky top-24 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="font-black text-base">Ringkasan Tagihan</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold">
                {items.length} Item
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Items breakdown */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const service = initialServices.find((s) => s.id === item.serviceId);
                const price = calculateItemPrice(item);
                return (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="font-bold text-slate-900">
                        {item.shoeBrand || "Sepatu"} {item.shoeModel}
                      </div>
                      <div className="text-slate-400">
                        {service?.name || "Treatment"} {item.isExpress && "(Express 1 Hari)"}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatRupiah(price)}</span>
                  </div>
                );
              })}

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Subtotal Treatment</span>
                <span className="font-mono font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>

              {serviceType === "PICKUP_DELIVERY" && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Ongkir Pickup & Delivery</span>
                  <span className="font-mono font-semibold text-slate-800">{formatRupiah(deliveryFee)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Pembayaran</span>
              <span className="font-black text-2xl text-sky-600 font-mono">{formatRupiah(grandTotal)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "QRIS"
                      ? "border-sky-400 bg-sky-50 text-sky-600 shadow-sm"
                      : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-sky-500" /> QRIS Instant
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "TRANSFER"
                      ? "border-sky-400 bg-sky-50 text-sky-600 shadow-sm"
                      : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-500" /> Virtual Account
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-black text-base rounded-full shadow-[0_10px_25px_rgba(0,194,255,0.3)] h-13"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses Order...
                </>
              ) : (
                <>
                  Konfirmasi & Bayar <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Garansi 100% Bersih & Resi Real-Time Langsung Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
