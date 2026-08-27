import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wind,
  Droplets,
  PackageCheck,
  Ban,
  Calendar,
  Send,
} from "lucide-react";

export type OrderStatusType =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "WASHED"
  | "DRYING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatusType = "UNPAID" | "PAID" | "EXPIRED" | "REFUNDED";

export type SocialStatusType = "DRAFT" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED";

export function OrderStatusBadge({ status }: { status: OrderStatusType | string }) {
  switch (status) {
    case "RECEIVED":
      return (
        <Badge variant="info" className="gap-1 font-mono text-xs">
          <Clock className="w-3.5 h-3.5" /> Antrian Masuk
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="warning" className="gap-1 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5" /> Proses Treatment
        </Badge>
      );
    case "WASHED":
      return (
        <Badge variant="info" className="gap-1 font-mono text-xs bg-sky-500/20 text-sky-700 dark:text-sky-300">
          <Droplets className="w-3.5 h-3.5" /> Sedang Dicuci
        </Badge>
      );
    case "DRYING":
      return (
        <Badge variant="secondary" className="gap-1 font-mono text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
          <Wind className="w-3.5 h-3.5" /> Pengeringan
        </Badge>
      );
    case "READY":
      return (
        <Badge variant="success" className="gap-1 font-mono text-xs">
          <PackageCheck className="w-3.5 h-3.5" /> Siap Diambil
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="gap-1 font-mono text-xs bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="gap-1 font-mono text-xs">
          <Ban className="w-3.5 h-3.5" /> Dibatalkan
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatusType | string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge variant="success" className="gap-1 font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge variant="warning" className="gap-1 font-mono text-xs">
          <Clock className="w-3.5 h-3.5" /> Belum Bayar
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="destructive" className="gap-1 font-mono text-xs">
          <AlertCircle className="w-3.5 h-3.5" /> Kedaluwarsa
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge variant="secondary" className="gap-1 font-mono text-xs">
          Refund
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function SocialStatusBadge({ status }: { status: SocialStatusType | string }) {
  switch (status) {
    case "SCHEDULED":
      return (
        <Badge variant="info" className="gap-1 font-mono text-xs">
          <Calendar className="w-3.5 h-3.5" /> Terjadwal
        </Badge>
      );
    case "PUBLISHING":
      return (
        <Badge variant="warning" className="gap-1 font-mono text-xs animate-pulse">
          <Send className="w-3.5 h-3.5" /> Menerbitkan...
        </Badge>
      );
    case "PUBLISHED":
      return (
        <Badge variant="success" className="gap-1 font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Terbit di Instagram
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1 font-mono text-xs">
          <AlertCircle className="w-3.5 h-3.5" /> Gagal Posting
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
