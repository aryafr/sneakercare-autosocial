import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// =========================================================================
// 1. BETTER AUTH SCHEMAS
// =========================================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "operator", "customer"] }).notNull().default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  tokenIdx: index("sessions_token_idx").on(table.token),
}));

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// =========================================================================
// 2. SERVICES & WORKSHOP SCHEMAS
// =========================================================================
export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  basePrice: real("base_price").notNull(),
  estimatedDays: integer("estimated_days").notNull().default(3),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// =========================================================================
// 3. MEDUSA-INSPIRED COMMERCE & MARKETPLACE SCHEMAS
// =========================================================================
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  handle: text("handle").notNull().unique(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  brand: text("brand").notNull().default("SO CLEAN Labs"),
  rating: real("rating").notNull().default(5.0),
  reviewCount: integer("review_count").notNull().default(24),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  handleIdx: index("products_handle_idx").on(table.handle),
  categoryIdx: index("products_category_idx").on(table.categoryId),
}));

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  title: text("title").notNull(), // e.g. "250ml", "500ml", "Standard Pack"
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  inventoryQuantity: integer("inventory_quantity").notNull().default(50),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  productIdx: index("product_variants_product_id_idx").on(table.productId),
}));

export const discounts = sqliteTable("discounts", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", { enum: ["PERCENTAGE", "FIXED"] }).notNull().default("PERCENTAGE"),
  value: real("value").notNull(), // e.g. 15 for 15% or 20000 for Rp 20.000
  minSubtotal: real("min_subtotal").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(100),
  usedCount: integer("used_count").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  validUntil: integer("valid_until", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const carts = sqliteTable("carts", {
  id: text("id").primaryKey(),
  customerId: text("customer_id"),
  promoCode: text("promo_code"),
  discountAmount: real("discount_amount").notNull().default(0),
  subtotal: real("subtotal").notNull().default(0),
  shippingTotal: real("shipping_total").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  itemType: text("item_type", { enum: ["PRODUCT", "SERVICE"] }).notNull().default("PRODUCT"),
  productId: text("product_id").references(() => products.id),
  variantId: text("variant_id").references(() => productVariants.id),
  serviceId: text("service_id").references(() => services.id),
  title: text("title").notNull(),
  variantTitle: text("variant_title"),
  thumbnail: text("thumbnail"),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  metadata: text("metadata"), // JSON string for shoeBrand, shoeModel, notes, isExpress
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  cartIdx: index("cart_items_cart_id_idx").on(table.cartId),
}));

// =========================================================================
// 4. UNIFIED ORDERS & FULFILLMENT
// =========================================================================
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  serviceType: text("service_type", { enum: ["DROP_OFF", "PICKUP_DELIVERY"] }).notNull().default("DROP_OFF"),
  deliveryAddress: text("delivery_address"),
  subtotal: real("subtotal").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  shippingFee: real("shipping_fee").notNull().default(0),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull().default("QRIS"),
  paymentStatus: text("payment_status", { enum: ["UNPAID", "PAID", "EXPIRED", "REFUNDED"] }).notNull().default("UNPAID"),
  orderStatus: text("order_status", { enum: ["RECEIVED", "IN_PROGRESS", "WASHED", "DRYING", "READY", "COMPLETED", "CANCELLED"] }).notNull().default("RECEIVED"),
  paymentReference: text("payment_reference"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  trackingCodeIdx: index("orders_tracking_code_idx").on(table.trackingCode),
  orderStatusIdx: index("orders_order_status_idx").on(table.orderStatus),
  paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus),
}));

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  itemType: text("item_type", { enum: ["SERVICE", "PRODUCT"] }).notNull().default("SERVICE"),
  serviceId: text("service_id").references(() => services.id),
  productId: text("product_id").references(() => products.id),
  variantId: text("variant_id").references(() => productVariants.id),
  title: text("title"),
  shoeBrand: text("shoe_brand"),
  shoeModel: text("shoe_model"),
  shoeColor: text("shoe_color"),
  specialNotes: text("special_notes"),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
  beforeImageUrl: text("before_image_url"),
  afterImageUrl: text("after_image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
}));

export const orderFulfillments = sqliteTable("order_fulfillments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  carrier: text("carrier").notNull().default("SO CLEAN Express Courier"),
  trackingNumber: text("tracking_number"),
  status: text("status", { enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] }).notNull().default("PENDING"),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// =========================================================================
// 5. POSTIZ-INSPIRED SOCIAL AUTOMATION SCHEMAS
// =========================================================================
export const socialAccounts = sqliteTable("social_accounts", {
  id: text("id").primaryKey(),
  platform: text("platform", { enum: ["INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER_X", "THREADS"] }).notNull().default("INSTAGRAM"),
  platformAccountId: text("platform_account_id").notNull(),
  accountName: text("account_name").notNull(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const socialMediaAssets = sqliteTable("social_media_assets", {
  id: text("id").primaryKey(),
  orderItemId: text("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type", { enum: ["IMAGE", "VIDEO", "STITCHED_1X1", "STITCHED_9X16"] }).notNull().default("STITCHED_1X1"),
  title: text("title").notNull(),
  shoeBrand: text("shoe_brand"),
  shoeModel: text("shoe_model"),
  tags: text("tags"), // comma-separated or JSON
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const socialTemplates = sqliteTable("social_templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  promptHook: text("prompt_hook").notNull(),
  templateBody: text("template_body").notNull(),
  hashtags: text("hashtags").notNull(),
  category: text("category").notNull().default("Restoration Report"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const socialPosts = sqliteTable("social_posts", {
  id: text("id").primaryKey(),
  orderItemId: text("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
  socialAccountId: text("social_account_id").notNull().references(() => socialAccounts.id),
  channelType: text("channel_type", { enum: ["INSTAGRAM", "TIKTOK", "FACEBOOK", "TWITTER_X", "THREADS"] }).notNull().default("INSTAGRAM"),
  stitchedImageUrl: text("stitched_image_url").notNull(),
  caption: text("caption").notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  status: text("status", { enum: ["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"] }).notNull().default("DRAFT"),
  qstashMessageId: text("qstash_message_id"),
  platformPostId: text("platform_post_id"),
  errorMessage: text("error_message"),
  viewsCount: integer("views_count").notNull().default(0),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  statusIdx: index("social_posts_status_idx").on(table.status),
  scheduledAtIdx: index("social_posts_scheduled_at_idx").on(table.scheduledAt),
}));

// Inferred TypeScript types
export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderFulfillment = typeof orderFulfillments.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type SocialMediaAsset = typeof socialMediaAssets.$inferSelect;
export type SocialTemplate = typeof socialTemplates.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
