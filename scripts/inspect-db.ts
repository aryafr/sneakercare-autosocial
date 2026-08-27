import { db } from "../db";
import { initDb } from "../db/init";
import { services, orders, orderItems, socialAccounts, socialTemplates, socialPosts } from "../db/schema";

async function main() {
  await initDb();

  const allServices = await db.select().from(services);
  const allOrders = await db.select().from(orders);
  const allItems = await db.select().from(orderItems);
  const allAccounts = await db.select().from(socialAccounts);
  const allTemplates = await db.select().from(socialTemplates);
  const allPosts = await db.select().from(socialPosts);

  console.log(
    JSON.stringify(
      {
        services: allServices,
        orders: allOrders,
        orderItems: allItems,
        socialAccounts: allAccounts,
        socialTemplates: allTemplates,
        socialPosts: allPosts,
      },
      null,
      2
    )
  );
}

main().catch(console.error);
