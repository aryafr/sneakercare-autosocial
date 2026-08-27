"use server";

import { db } from "@/db";
import { socialAccounts, socialTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { initDb } from "@/db/init";

export async function getSocialAccounts() {
  try {
    await initDb();
    const accounts = await db.select().from(socialAccounts).orderBy(desc(socialAccounts.createdAt));
    return { data: accounts };
  } catch (error: any) {
    console.error("Error fetching social accounts:", error);
    return { error: error.message };
  }
}

export async function getSocialTemplates() {
  try {
    await initDb();
    const templates = await db.select().from(socialTemplates).orderBy(desc(socialTemplates.createdAt));
    return { data: templates };
  } catch (error: any) {
    console.error("Error fetching social templates:", error);
    return { error: error.message };
  }
}

export async function toggleSocialAccountStatus(accountId: string, currentStatus: boolean) {
  try {
    await initDb();
    await db
      .update(socialAccounts)
      .set({ isActive: !currentStatus })
      .where(eq(socialAccounts.id, accountId));
      
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling account status:", error);
    return { error: error.message };
  }
}
