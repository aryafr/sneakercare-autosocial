"use server";

import { db } from "@/db";
import { socialPosts, socialAccounts, orderItems, orders, services, type SocialPost } from "@/db/schema";
import { buildStitchedImageUrl } from "@/lib/cloudinary";
import { scheduleSocialPostToQStash } from "@/lib/qstash";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schedulePostSchema, type SchedulePostInput } from "@/lib/validations";

/**
 * Get or seed default Instagram Business Account
 */
export async function getOrCreateDefaultSocialAccount() {
  try {
    let [account] = await db.select().from(socialAccounts).limit(1);

    if (!account) {
      const id = "soc_default_ig";
      await db.insert(socialAccounts).values({
        id,
        platform: "INSTAGRAM",
        platformAccountId: "17841400000000000",
        accountName: "@sneakercare.official",
        accessToken: "EAAB_INSTAGRAM_GRAPH_DEV_ACCESS_TOKEN",
        isActive: true,
      });

      [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    }

    return { success: true, data: account };
  } catch (err: any) {
    console.error("Error getting social account:", err);
    return { success: false, error: err.message || "Gagal memuat akun Instagram" };
  }
}

/**
 * Get completed order items that have both Before & After images ready for social posting
 */
export async function getCompletedItemsForSocial() {
  try {
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceId: orderItems.serviceId,
        serviceName: services.name,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        shoeColor: orderItems.shoeColor,
        beforeImageUrl: orderItems.beforeImageUrl,
        afterImageUrl: orderItems.afterImageUrl,
        customerName: orders.customerName,
        trackingCode: orders.trackingCode,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(and(isNotNull(orderItems.beforeImageUrl), isNotNull(orderItems.afterImageUrl)))
      .orderBy(desc(orderItems.createdAt));

    return { success: true, data: items };
  } catch (err: any) {
    console.error("Error fetching items for social:", err);
    return { success: false, error: err.message || "Gagal memuat item foto" };
  }
}

/**
 * Schedule a social media post with dynamic Before/After stitching and QStash dispatch
 */
export async function createScheduledPost(input: SchedulePostInput) {
  try {
    const validated = schedulePostSchema.parse(input);

    if (!validated.orderItemId) {
      return { success: false, error: "Order item id wajib diisi." };
    }

    // Fetch order item details
    const [item] = await db
      .select({
        id: orderItems.id,
        beforeImageUrl: orderItems.beforeImageUrl,
        afterImageUrl: orderItems.afterImageUrl,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        serviceName: services.name,
      })
      .from(orderItems)
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(eq(orderItems.id, validated.orderItemId))
      .limit(1);

    if (!item || !item.beforeImageUrl || !item.afterImageUrl) {
      return { success: false, error: "Item tidak memiliki foto Before & After yang lengkap." };
    }

    const { data: account } = await getOrCreateDefaultSocialAccount();
    if (!account) {
      return { success: false, error: "Akun Instagram belum terhubung." };
    }

    // Build dynamic 1080x1080 stitched image URL
    const stitchedImageUrl = buildStitchedImageUrl({
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
      shoeBrand: item.shoeBrand || "Sneaker",
      shoeModel: item.shoeModel || "Care",
      serviceName: item.serviceName || "Sneaker Treatment",
    });

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Dispatch to Upstash QStash
    const webhookUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/webhooks/qstash`;
    const qstashResult = await scheduleSocialPostToQStash(webhookUrl, {
      postId,
      orderItemId: item.id,
      socialAccountId: account.id,
      imageUrl: stitchedImageUrl,
      caption: validated.caption,
      scheduledAt: validated.scheduledAt,
    });

    // Save to database
    await db.insert(socialPosts).values({
      id: postId,
      orderItemId: item.id,
      socialAccountId: account.id,
      stitchedImageUrl,
      caption: validated.caption,
      scheduledAt: new Date(validated.scheduledAt * 1000),
      status: "SCHEDULED",
      qstashMessageId: qstashResult.messageId,
    });

    try {
      revalidatePath("/admin/social");
    } catch {}

    return {
      success: true,
      postId,
      stitchedImageUrl,
      qstashMessageId: qstashResult.messageId,
    };
  } catch (err: any) {
    console.error("Error creating scheduled post:", err);
    return {
      success: false,
      error: err.errors ? err.errors.map((e: any) => e.message).join(", ") : err.message || "Gagal menjadwalkan post",
    };
  }
}

/**
 * Publish post immediately or execute webhook publish logic
 */
export async function executePublishPost(postId: string) {
  try {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, postId)).limit(1);
    if (!post) {
      return { success: false, error: "Post tidak ditemukan" };
    }

    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, post.socialAccountId)).limit(1);

    // Update status to PUBLISHING
    await db.update(socialPosts).set({ status: "PUBLISHING" }).where(eq(socialPosts.id, postId));

    // If Meta Access Token is available, call Instagram Graph API
    if (account?.accessToken && process.env.META_APP_ID && !account.accessToken.startsWith("EAAB_INSTAGRAM_GRAPH_DEV")) {
      try {
        // Step 1: Create media container
        const containerRes = await fetch(
          `https://graph.facebook.com/v20.0/${account.platformAccountId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: post.stitchedImageUrl,
              caption: post.caption,
              access_token: account.accessToken,
            }),
          }
        );

        const containerData = await containerRes.json();
        if (!containerData.id) {
          throw new Error(containerData.error?.message || "Gagal membuat Instagram media container");
        }

        // Step 2: Publish media container
        const publishRes = await fetch(
          `https://graph.facebook.com/v20.0/${account.platformAccountId}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: account.accessToken,
            }),
          }
        );

        const publishData = await publishRes.json();
        if (!publishData.id) {
          throw new Error(publishData.error?.message || "Gagal mempublikasikan media ke Instagram");
        }

        // Mark PUBLISHED
        await db
          .update(socialPosts)
          .set({
            status: "PUBLISHED",
            platformPostId: publishData.id,
            publishedAt: new Date(),
            errorMessage: null,
          })
          .where(eq(socialPosts.id, postId));
      } catch (igErr: any) {
        await db
          .update(socialPosts)
          .set({
            status: "FAILED",
            errorMessage: igErr.message || "Instagram API Error",
          })
          .where(eq(socialPosts.id, postId));

        return { success: false, error: igErr.message };
      }
    } else {
      // Simulated publish for local development & demonstration
      const simulatedIgPostId = `ig_post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db
        .update(socialPosts)
        .set({
          status: "PUBLISHED",
          platformPostId: simulatedIgPostId,
          publishedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(socialPosts.id, postId));
    }

    try {
      revalidatePath("/admin/social");
    } catch {}
    return { success: true };
  } catch (err: any) {
    console.error("Error publishing post:", err);
    await db
      .update(socialPosts)
      .set({
        status: "FAILED",
        errorMessage: err.message,
      })
      .where(eq(socialPosts.id, postId));

    return { success: false, error: err.message };
  }
}

/**
 * Get list of all social posts
 */
export async function getSocialPostsList() {
  try {
    const list = await db
      .select({
        id: socialPosts.id,
        orderItemId: socialPosts.orderItemId,
        socialAccountId: socialPosts.socialAccountId,
        stitchedImageUrl: socialPosts.stitchedImageUrl,
        caption: socialPosts.caption,
        scheduledAt: socialPosts.scheduledAt,
        publishedAt: socialPosts.publishedAt,
        status: socialPosts.status,
        qstashMessageId: socialPosts.qstashMessageId,
        platformPostId: socialPosts.platformPostId,
        errorMessage: socialPosts.errorMessage,
        createdAt: socialPosts.createdAt,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        serviceName: services.name,
      })
      .from(socialPosts)
      .leftJoin(orderItems, eq(socialPosts.orderItemId, orderItems.id))
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .orderBy(desc(socialPosts.createdAt));

    return { success: true, data: list };
  } catch (err: any) {
    console.error("Error fetching social posts:", err);
    return { success: false, error: err.message || "Gagal memuat jadwal media sosial" };
  }
}
