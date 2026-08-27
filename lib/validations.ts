import { z } from "zod";

// =========================================================================
// 1. ORDER & BOOKING VALIDATIONS
// =========================================================================
export const orderItemSchema = z.object({
  serviceId: z.string().optional(),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  itemType: z.enum(["SERVICE", "PRODUCT"]).default("SERVICE"),
  title: z.string().optional(),
  shoeBrand: z.string().optional(),
  shoeModel: z.string().optional(),
  shoeColor: z.string().optional(),
  specialNotes: z.string().optional(),
  quantity: z.number().min(1).default(1),
  price: z.number().min(0, "Harga tidak valid"),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z.string().min(8, "Nomor WhatsApp tidak valid"),
  customerEmail: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  serviceType: z.enum(["DROP_OFF", "PICKUP_DELIVERY"]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.string().default("QRIS"),
  promoCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Minimal pilih 1 item"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// =========================================================================
// 2. MEDUSA-INSPIRED COMMERCE & CART VALIDATIONS
// =========================================================================
export const addToCartSchema = z.object({
  cartId: z.string().optional(),
  itemType: z.enum(["PRODUCT", "SERVICE"]),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  serviceId: z.string().optional(),
  title: z.string().min(1, "Judul item wajib diisi"),
  variantTitle: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().min(1).default(1),
  metadata: z
    .object({
      shoeBrand: z.string().optional(),
      shoeModel: z.string().optional(),
      shoeColor: z.string().optional(),
      specialNotes: z.string().optional(),
      isExpress: z.boolean().optional(),
    })
    .optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const applyCouponSchema = z.object({
  cartId: z.string().min(1),
  code: z.string().min(2, "Kode promo tidak valid"),
});

export const cartCheckoutSchema = z.object({
  cartId: z.string().min(1),
  customerName: z.string().min(2, "Nama wajib diisi"),
  customerPhone: z.string().min(8, "Nomor WhatsApp tidak valid"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  serviceType: z.enum(["DROP_OFF", "PICKUP_DELIVERY"]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.string().default("QRIS"),
});

export type CartCheckoutInput = z.infer<typeof cartCheckoutSchema>;

// =========================================================================
// 3. POSTIZ-INSPIRED SOCIAL AUTOMATION VALIDATIONS
// =========================================================================
export const schedulePostSchema = z.object({
  orderItemId: z.string().optional(),
  channels: z.array(z.enum(["INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER_X", "THREADS"])).min(1, "Pilih minimal 1 channel"),
  caption: z.string().min(5, "Caption minimal 5 karakter"),
  customCaptions: z
    .record(z.string(), z.string())
    .optional(), // platform-specific override
  scheduledAt: z.number().min(Math.floor(Date.now() / 1000) - 60, "Waktu jadwal tidak boleh di masa lalu"),
  stitchedImageUrl: z.string().optional(),
});

export type SchedulePostInput = z.infer<typeof schedulePostSchema>;

export const aiCaptionPromptSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  treatment: z.string().optional(),
  customerName: z.string().optional(),
  tone: z.enum(["PROFESSIONAL", "VIRAL_HOOK", "CASUAL_SNEAKERHEAD", "PROMOTIONAL"]).default("PROFESSIONAL"),
  customHook: z.string().optional(),
});

export type AiCaptionPromptInput = z.infer<typeof aiCaptionPromptSchema>;
