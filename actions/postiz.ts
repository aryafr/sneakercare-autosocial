"use server";

import { db } from "@/db";
import {
  socialPosts,
  socialAccounts,
  socialMediaAssets,
  socialTemplates,
  orderItems,
  orders,
  services,
  type SocialPost,
  type SocialAccount,
  type SocialMediaAsset,
} from "@/db/schema";
import { buildStitchedImageUrl } from "@/lib/cloudinary";
import { scheduleSocialPostToQStash } from "@/lib/qstash";
import { schedulePostSchema, aiCaptionPromptSchema, type SchedulePostInput, type AiCaptionPromptInput } from "@/lib/validations";
import { eq, desc, and, gte, lte, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Fetch connected social channels (Instagram, TikTok, Facebook, X, Threads)
 */
export async function getSocialChannels() {
  try {
    const list = await db.select().from(socialAccounts).where(eq(socialAccounts.isActive, true));
    return { success: true, data: list };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memuat akun sosial" };
  }
}

/**
 * Fetch scheduled posts for visual Content Calendar (Postiz Calendar View)
 */
export async function getSocialCalendarPosts(month: number, year: number) {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const posts = await db
      .select({
        id: socialPosts.id,
        orderItemId: socialPosts.orderItemId,
        socialAccountId: socialPosts.socialAccountId,
        channelType: socialPosts.channelType,
        stitchedImageUrl: socialPosts.stitchedImageUrl,
        caption: socialPosts.caption,
        scheduledAt: socialPosts.scheduledAt,
        publishedAt: socialPosts.publishedAt,
        status: socialPosts.status,
        accountName: socialAccounts.accountName,
        platform: socialAccounts.platform,
        shoeBrand: orderItems.shoeBrand,
        shoeModel: orderItems.shoeModel,
        serviceName: services.name,
      })
      .from(socialPosts)
      .leftJoin(socialAccounts, eq(socialPosts.socialAccountId, socialAccounts.id))
      .leftJoin(orderItems, eq(socialPosts.orderItemId, orderItems.id))
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(and(gte(socialPosts.scheduledAt, startOfMonth), lte(socialPosts.scheduledAt, endOfMonth)))
      .orderBy(socialPosts.scheduledAt);

    return { success: true, data: posts };
  } catch (err: any) {
    console.error("Calendar fetch error:", err);
    return { success: false, error: err.message || "Gagal memuat data kalender" };
  }
}

/**
 * Create multi-channel post (Postiz-Style Multi-Platform Composer)
 */
export async function createMultiChannelPost(input: SchedulePostInput) {
  try {
    const validated = schedulePostSchema.parse(input);

    let stitchedImageUrl = validated.stitchedImageUrl || "";

    // If orderItemId is provided and no stitchedImageUrl, generate dynamic 1:1 image
    if (validated.orderItemId && !stitchedImageUrl) {
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

      if (item?.beforeImageUrl && item?.afterImageUrl) {
        stitchedImageUrl = buildStitchedImageUrl({
          beforeImageUrl: item.beforeImageUrl,
          afterImageUrl: item.afterImageUrl,
          shoeBrand: item.shoeBrand || "Sneaker",
          shoeModel: item.shoeModel || "Restoration",
          serviceName: item.serviceName || "Deep Clean",
        });
      }
    }

    if (!stitchedImageUrl) {
      stitchedImageUrl = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop";
    }

    const channels = await db.select().from(socialAccounts).where(eq(socialAccounts.isActive, true));
    const createdPostIds: string[] = [];

    // Create a post record for each target channel with custom caption if specified
    for (const channelType of validated.channels) {
      const targetAccount = channels.find((c) => c.platform === channelType) || channels[0];
      if (!targetAccount) continue;

      const postCaption = validated.customCaptions?.[channelType] || validated.caption;
      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Schedule QStash dispatch
      const webhookUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/webhooks/qstash`;
      const qstashResult = await scheduleSocialPostToQStash(webhookUrl, {
        postId,
        orderItemId: validated.orderItemId || undefined,
        socialAccountId: targetAccount.id,
        imageUrl: stitchedImageUrl,
        caption: postCaption,
        scheduledAt: validated.scheduledAt,
      });

      await db.insert(socialPosts).values({
        id: postId,
        orderItemId: validated.orderItemId || null,
        socialAccountId: targetAccount.id,
        channelType,
        stitchedImageUrl,
        caption: postCaption,
        scheduledAt: new Date(validated.scheduledAt * 1000),
        status: "SCHEDULED",
        qstashMessageId: qstashResult.messageId,
      });

      createdPostIds.push(postId);
    }

    try {
      revalidatePath("/admin/social");
      revalidatePath("/admin/social/calendar");
    } catch {}

    return {
      success: true,
      postIds: createdPostIds,
      channelCount: createdPostIds.length,
    };
  } catch (err: any) {
    console.error("Multi-channel post error:", err);
    return { success: false, error: err.message || "Gagal menjadwalkan multi-channel post" };
  }
}

/**
 * AI-Powered Caption & Hook Generator (Postiz AI Assistant)
 */
export async function generateAiCaptions(input: AiCaptionPromptInput) {
  try {
    const brand = input.brand || "Nike";
    const model = input.model || "Air Jordan 1";
    const treatment = input.treatment || "Deep Clean & Midsole Unyellowing";
    const customer = input.customerName || "Pelanggan Setia";

    let hook = "";
    let captionBody = "";
    let hashtags = "#sneakercare #shoelaundry #beforeandafter #sneakerrestoration #cucisepatu #cucisepatujakarta";

    if (input.tone === "VIRAL_HOOK") {
      hook = `DARI KOTOR PARAH SAMPAI KINCLONG SEPERTI BARU!`;
      captionBody = `${hook}\n\nSiapa sangka sepatu ${brand} ${model} yang tadinya penuh noda membandel ini bisa kembali glowing seperti baru keluar dari store?\n\nDengan formula pH netral dan detailing 3 tahap di Workshop SO CLEAN, setiap serat material tetap terjaga aman 100%.\n\nSepatu kesayanganmu kotor juga? Drop ke workshop kami atau booking pickup delivery sekarang!\n\n${hashtags}`;
    } else if (input.tone === "PROMOTIONAL") {
      hook = `SPECIAL PROMO WEEKEND SNEAKER SPA!`;
      captionBody = `${hook}\n\nBikin sepatu ${brand} ${model} kamu kembali siap tempur di awal pekan! Dapatkan treatment ${treatment} dengan standar QC 3 tahap.\n\nKlik link di bio untuk booking slot pencucian hari ini.\n\n${hashtags}`;
    } else if (input.tone === "CASUAL_SNEAKERHEAD") {
      hook = `RESTOCKED TO PERFECTION: ${brand.toUpperCase()} ${model.toUpperCase()}`;
      captionBody = `${hook}\n\nPerawatan khusus untuk rilisan grail ${brand} ${model} milik bro/sis ${customer}. Dari midsole kuning teroksidasi hingga kembali crisp white tanpa merusak tekstur karet.\n\nSneakerheads tahu ke mana harus mempercayakan sepatunya!\n\n${hashtags}`;
    } else {
      // PROFESSIONAL RESTORATION REPORT
      hook = `SNEAKERCARE RESTORATION REPORT`;
      captionBody = `${hook}\n\nSepatu ${brand} ${model} milik ${customer} telah selesai menjalani treatment ${treatment} di Workshop SO CLEAN.\n\nBerikut dokumentasi perbandingan Before/After hasil pengerjaan tim teknisi kami. Dari noda membandel hingga kembali bersih dan terawat optimal.\n\nKonsultasi dan pemesanan layanan perawatan sepatu dapat diakses melalui website resmi kami.\n\n${hashtags}`;
    }

    return {
      success: true,
      data: {
        hook,
        caption: captionBody,
        hashtags,
        characterCount: captionBody.length,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghasilkan caption AI" };
  }
}

/**
 * Fetch Media Vault Assets (Postiz Media Manager)
 */
export async function getMediaVaultAssets(filter?: { brand?: string; type?: string }) {
  try {
    const list = await db
      .select({
        id: socialMediaAssets.id,
        orderItemId: socialMediaAssets.orderItemId,
        mediaUrl: socialMediaAssets.mediaUrl,
        mediaType: socialMediaAssets.mediaType,
        title: socialMediaAssets.title,
        shoeBrand: socialMediaAssets.shoeBrand,
        shoeModel: socialMediaAssets.shoeModel,
        tags: socialMediaAssets.tags,
        createdAt: socialMediaAssets.createdAt,
      })
      .from(socialMediaAssets)
      .orderBy(desc(socialMediaAssets.createdAt));

    return { success: true, data: list };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memuat media vault" };
  }
}
