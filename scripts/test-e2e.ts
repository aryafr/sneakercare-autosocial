import { createOrder, getOrderByTrackingCode, updateOrderStatus, updateItemImages, getDashboardMetrics } from "../actions/orders";
import { getCompletedItemsForSocial, createScheduledPost, executePublishPost, getSocialPostsList } from "../actions/social";
import { initDb } from "../db/init";

async function runE2ETests() {
  console.log("==================================================");
  console.log("🧪 STARTING END-TO-END VERIFICATION TESTS");
  console.log("==================================================");

  // 1. Initialize DB
  await initDb();
  console.log("✅ Step 1: Database initialized.");

  // 2. Test Customer Booking Creation
  const newOrderPayload = {
    customerName: "Gading Marten",
    customerPhone: "081299887766",
    customerEmail: "gading@example.com",
    serviceType: "DROP_OFF" as const,
    deliveryAddress: "",
    paymentMethod: "QRIS",
    items: [
      {
        serviceId: "serv_deep_clean",
        itemType: "SERVICE" as const,
        quantity: 1,
        shoeBrand: "Nike",
        shoeModel: "Dunk Low Panda",
        shoeColor: "Black/White",
        specialNotes: "Noda saus membandel di toebox",
        price: 50000,
      },
    ],
  };

  const createResult = await createOrder(newOrderPayload);
  if (!createResult.success || !createResult.trackingCode) {
    throw new Error(`Order creation failed: ${createResult.error}`);
  }
  console.log(`✅ Step 2: Order created successfully! Tracking Code: ${createResult.trackingCode}`);

  // 3. Test Public Tracking Lookup
  const trackingLookup = await getOrderByTrackingCode(createResult.trackingCode);
  if (!trackingLookup.success || !trackingLookup.data) {
    throw new Error(`Tracking lookup failed: ${trackingLookup.error}`);
  }
  console.log(`✅ Step 3: Public tracking lookup succeeded for ${trackingLookup.data.customerName} (Status: ${trackingLookup.data.orderStatus})`);

  // 4. Test Workshop Order Status Progression
  const updateStatusRes = await updateOrderStatus(createResult.orderId!, "IN_PROGRESS");
  if (!updateStatusRes.success) {
    throw new Error(`Status update failed: ${updateStatusRes.error}`);
  }
  console.log("✅ Step 4: Order status updated to IN_PROGRESS.");

  // 5. Test Before & After Photo Upload
  const itemId = trackingLookup.data.items[0].id;
  const imageUploadRes = await updateItemImages(itemId, {
    beforeImageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    afterImageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  });
  if (!imageUploadRes.success) {
    throw new Error("Image update failed");
  }
  console.log("✅ Step 5: Before & After photos uploaded for item.");

  // 6. Test AutoSocial Post Creation & Dynamic Stitching
  const socialItems = await getCompletedItemsForSocial();
  const targetItem = socialItems.data?.find((i) => i.id === itemId);
  if (!targetItem) {
    throw new Error("Item not found in completed social items list");
  }

  const scheduleRes = await createScheduledPost({
    orderItemId: itemId,
    channels: ["INSTAGRAM"],
    caption: "Nike Dunk Panda Restored to Perfection! ✨ #sneakercare #restoration",
    scheduledAt: Math.floor(Date.now() / 1000) + 3600,
  });
  if (!scheduleRes.success || !scheduleRes.postId) {
    throw new Error(`Social post scheduling failed: ${scheduleRes.error}`);
  }
  console.log(`✅ Step 6: Social post scheduled! Stitched URL: ${scheduleRes.stitchedImageUrl}`);

  // 7. Test Instant Publishing Execution
  const publishRes = await executePublishPost(scheduleRes.postId);
  if (!publishRes.success) {
    throw new Error(`Publish execution failed: ${publishRes.error}`);
  }
  console.log("✅ Step 7: Social post published successfully to Meta Instagram Graph API (Simulated/Production).");

  // 8. Test Metrics Calculation
  const metrics = await getDashboardMetrics();
  console.log(`✅ Step 8: Dashboard metrics computed: Total Orders = ${metrics.data?.totalOrders}, In Progress = ${metrics.data?.inProgressCount}`);

  console.log("==================================================");
  console.log("🎉 ALL E2E TESTS PASSED SUCCESSFULLY! 100% READY.");
  console.log("==================================================");
}

runE2ETests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
