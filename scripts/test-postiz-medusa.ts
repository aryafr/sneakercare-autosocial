import { initDb } from "../db/init";
import { getProductsList, getProductByHandle, getCategories } from "../actions/products";
import { getOrCreateCart, addItemToCart, applyCouponToCart, checkoutCartWorkflow } from "../actions/cart";
import { getSocialChannels, getSocialCalendarPosts, createMultiChannelPost, generateAiCaptions } from "../actions/postiz";

async function runPostizAndMedusaTests() {
  console.log("==================================================");
  console.log("🧪 STARTING MEDUSA-COMMERCE & POSTIZ-SOCIAL TESTS");
  console.log("==================================================");

  // 1. Initialize Database & Seed
  await initDb();
  console.log("✅ Step 1: Database initialized with Medusa & Postiz schemas.");

  // 2. Medusa Product Catalog Test
  const productsRes = await getProductsList();
  if (!productsRes.success || !productsRes.data || productsRes.data.length === 0) {
    throw new Error("Failed to fetch products: " + productsRes.error);
  }
  console.log(`✅ Step 2: Medusa Product Catalog loaded. Total Products: ${productsRes.data.length}`);
  const firstProduct = productsRes.data[0];
  console.log(`   Sample: ${firstProduct.title} (Variants: ${firstProduct.variants.length})`);

  // 3. Medusa Cart & Multi-Item Add Test (Product + Service)
  const cartRes = await getOrCreateCart();
  if (!cartRes.success || !cartRes.data) {
    throw new Error("Failed to create cart");
  }
  const cartId = cartRes.data.id;
  console.log(`✅ Step 3: Shopping Cart initialized. Cart ID: ${cartId}`);

  // Add Physical Product to Cart
  const addProdRes = await addItemToCart({
    cartId,
    itemType: "PRODUCT",
    productId: firstProduct.id,
    variantId: firstProduct.variants[0].id,
    title: firstProduct.title,
    variantTitle: firstProduct.variants[0].title,
    price: firstProduct.variants[0].price,
    quantity: 1,
  });
  if (!addProdRes.success || !addProdRes.data) {
    throw new Error("Failed to add product to cart");
  }
  console.log(`✅ Step 4: Added physical product to cart. Subtotal: Rp ${addProdRes.data.subtotal.toLocaleString("id-ID")}`);

  // Add Shoe Cleaning Service to same Cart
  const addServRes = await addItemToCart({
    cartId,
    itemType: "SERVICE",
    serviceId: "serv_deep_clean",
    title: "Deep Clean (Air Jordan 1 High)",
    price: 50000,
    quantity: 1,
    metadata: {
      shoeBrand: "Nike",
      shoeModel: "Air Jordan 1 High",
      isExpress: false,
    },
  });
  if (!addServRes.success || !addServRes.data) {
    throw new Error("Failed to add service to cart");
  }
  console.log(`✅ Step 5: Added sneaker cleaning service to cart. Total items: ${addServRes.data.items.length}, Subtotal: Rp ${addServRes.data.subtotal.toLocaleString("id-ID")}`);

  // 4. Medusa Coupon / Discount Engine Test
  const couponRes = await applyCouponToCart(cartId, "SOCLEAN15");
  if (!couponRes.success || !couponRes.data) {
    throw new Error("Failed to apply discount coupon: " + couponRes.error);
  }
  console.log(`✅ Step 6: Applied 15% discount coupon (SOCLEAN15). Discount: Rp ${couponRes.data.discountAmount.toLocaleString("id-ID")}, Total: Rp ${couponRes.data.totalAmount.toLocaleString("id-ID")}`);

  // 5. Medusa Checkout Workflow Test
  const checkoutRes = await checkoutCartWorkflow({
    cartId,
    customerName: "Nicholas Saputra",
    customerPhone: "081299887766",
    customerEmail: "nicholas@example.com",
    serviceType: "PICKUP_DELIVERY",
    deliveryAddress: "Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan",
    paymentMethod: "QRIS",
  });
  if (!checkoutRes.success || !checkoutRes.trackingCode) {
    throw new Error("Checkout workflow failed: " + checkoutRes.error);
  }
  console.log(`✅ Step 7: Medusa Cart converted to unified Order! Tracking Code: ${checkoutRes.trackingCode}, Total: Rp ${checkoutRes.totalAmount?.toLocaleString("id-ID")}`);

  // 6. Postiz Social Channels Query Test
  const channelsRes = await getSocialChannels();
  if (!channelsRes.success || !channelsRes.data || channelsRes.data.length === 0) {
    throw new Error("Failed to fetch social channels");
  }
  console.log(`✅ Step 8: Postiz Social Channels loaded. Connected: ${channelsRes.data.map((c) => c.platform).join(", ")}`);

  // 7. Postiz AI Caption Generator Test
  const aiRes = await generateAiCaptions({
    brand: "Nike",
    model: "Air Jordan 1 Retro High",
    treatment: "Deep Clean & Unyellowing",
    customerName: "Nicholas Saputra",
    tone: "VIRAL_HOOK",
  });
  if (!aiRes.success || !aiRes.data) {
    throw new Error("Failed to generate AI caption");
  }
  console.log(`✅ Step 9: Postiz AI Hook generated successfully (${aiRes.data.characterCount} chars)`);
  console.log(`   Hook: "${aiRes.data.hook}"`);

  // 8. Postiz Multi-Channel Post Scheduling Test
  const scheduleRes = await createMultiChannelPost({
    channels: ["INSTAGRAM", "TIKTOK", "FACEBOOK"],
    caption: aiRes.data.caption,
    scheduledAt: Math.floor(Date.now() / 1000) + 7200,
    stitchedImageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  });
  if (!scheduleRes.success || !scheduleRes.postIds) {
    throw new Error("Failed to schedule multi-channel post: " + scheduleRes.error);
  }
  console.log(`✅ Step 10: Multi-Channel Post scheduled across ${scheduleRes.channelCount} platforms! Post IDs: ${scheduleRes.postIds.join(", ")}`);

  // 9. Postiz Content Calendar Month Matrix Test
  const now = new Date();
  const calendarRes = await getSocialCalendarPosts(now.getMonth() + 1, now.getFullYear());
  if (!calendarRes.success || !calendarRes.data) {
    throw new Error("Failed to fetch calendar posts");
  }
  console.log(`✅ Step 11: Content Calendar query successful. Total Posts in Month: ${calendarRes.data.length}`);

  console.log("==================================================");
  console.log("🎉 ALL MEDUSA & POSTIZ ARCHITECTURE TESTS PASSED!");
  console.log("==================================================");
}

runPostizAndMedusaTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
