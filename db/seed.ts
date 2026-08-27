import { initDb } from "./init";
import { db } from "./index";
import { services, users, accounts, orders, orderItems, socialAccounts } from "./schema";
import { hashPassword } from "../lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Initializing tables & seeding SneakerCare database...");
  await initDb();
  console.log("✅ Tables initialized.");

  // 1. Seed Services
  const defaultServices = [
    {
      id: "serv_deep_clean",
      name: "Deep Clean",
      slug: "deep-clean",
      description: "Pencucian menyeluruh luar & dalam termasuk insole, midsole, upper, dan outsole.",
      basePrice: 50000,
      estimatedDays: 3,
      isActive: true,
    },
    {
      id: "serv_fast_clean",
      name: "Fast Clean",
      slug: "fast-clean",
      description: "Pembersihan cepat bagian luar dan midsole untuk kotoran debu harian.",
      basePrice: 35000,
      estimatedDays: 1,
      isActive: true,
    },
    {
      id: "serv_unyellowing",
      name: "Unyellowing Treatment",
      slug: "unyellowing",
      description: "Penghilangan noda kuning teroksidasi pada midsole menggunakan formula UV & cream khusus.",
      basePrice: 75000,
      estimatedDays: 4,
      isActive: true,
    },
    {
      id: "serv_repaint",
      name: "Repaint & Restoration",
      slug: "repaint-restoration",
      description: "Pengecatan ulang presisi mengembalikan warna asli sepatu yang pudar atau lecet.",
      basePrice: 100000,
      estimatedDays: 5,
      isActive: true,
    },
    {
      id: "serv_leather",
      name: "Leather Care & Conditioning",
      slug: "leather-care",
      description: "Perawatan khusus bahan kulit dengan formula wax pelembab agar tidak pecah-pecah.",
      basePrice: 60000,
      estimatedDays: 3,
      isActive: true,
    },
    {
      id: "serv_suede",
      name: "Suede & Nubuck Clean",
      slug: "suede-clean",
      description: "Pembersihan lembut dan penyisiran serat halus tanpa merusak tekstur suede.",
      basePrice: 55000,
      estimatedDays: 3,
      isActive: true,
    },
  ];

  for (const s of defaultServices) {
    const [existing] = await db.select().from(services).where(eq(services.id, s.id)).limit(1);
    if (!existing) {
      await db.insert(services).values(s);
    }
  }
  console.log("✅ Services seeded successfully.");

  // 2. Seed Default Users
  const hashedPassword = await hashPassword("admin123");

  const defaultUsers = [
    {
      id: "usr_admin_01",
      name: "Workshop Owner (Admin)",
      email: "admin@sneakercare.local",
      role: "admin" as const,
      password: hashedPassword,
    },
    {
      id: "usr_operator_01",
      name: "Budi Operator",
      email: "operator@sneakercare.local",
      role: "operator" as const,
      password: hashedPassword,
    },
  ];

  for (const u of defaultUsers) {
    const [existing] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    if (!existing) {
      await db.insert(users).values({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
      });

      await db.insert(accounts).values({
        id: `acc_${u.id}`,
        userId: u.id,
        accountId: u.email,
        providerId: "credentials",
        password: u.password,
      });
    }
  }
  console.log("✅ Admin and Operator users seeded.");

  // 3. Seed Default Social Account
  const [existingSocial] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, "soc_default_ig")).limit(1);
  if (!existingSocial) {
    await db.insert(socialAccounts).values({
      id: "soc_default_ig",
      platform: "INSTAGRAM",
      platformAccountId: "17841400000000000",
      accountName: "@sneakercare.official",
      accessToken: "EAAB_INSTAGRAM_GRAPH_DEV_ACCESS_TOKEN",
      isActive: true,
    });
    console.log("✅ Instagram Social Account connected.");
  }

  // 4. Seed Initial Demonstration Orders
  const sampleOrder1 = {
    id: "ord_sample_01",
    trackingCode: "SC-2026-AF7K",
    customerName: "Raditya Dika",
    customerPhone: "081288990011",
    customerEmail: "raditya@example.com",
    serviceType: "DROP_OFF" as const,
    deliveryAddress: null,
    totalAmount: 125000,
    paymentStatus: "PAID" as const,
    orderStatus: "READY" as const,
    paymentReference: "PAY-2026-001",
  };

  const [existingOrder1] = await db.select().from(orders).where(eq(orders.id, sampleOrder1.id)).limit(1);
  if (!existingOrder1) {
    await db.insert(orders).values(sampleOrder1);
    await db.insert(orderItems).values({
      id: "item_sample_01",
      orderId: sampleOrder1.id,
      serviceId: "serv_deep_clean",
      shoeBrand: "Nike",
      shoeModel: "Air Jordan 1 Retro High Chicago",
      shoeColor: "Red / White / Black",
      specialNotes: "Noda lumpur pekat di toebox dan outsole",
      price: 50000,
      beforeImageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
      afterImageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    });
    await db.insert(orderItems).values({
      id: "item_sample_02",
      orderId: sampleOrder1.id,
      serviceId: "serv_unyellowing",
      shoeBrand: "Adidas",
      shoeModel: "Yeezy Boost 350 V2 Cream White",
      shoeColor: "Triple White",
      specialNotes: "Midsole menguning parah",
      price: 75000,
      beforeImageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
      afterImageUrl: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
    });
  }

  const sampleOrder2 = {
    id: "ord_sample_02",
    trackingCode: "SC-2026-W9QX",
    customerName: "Siti Nurhaliza",
    customerPhone: "081987654321",
    customerEmail: "siti@example.com",
    serviceType: "PICKUP_DELIVERY" as const,
    deliveryAddress: "Jl. Senopati No. 42, Jakarta Selatan",
    totalAmount: 100000,
    paymentStatus: "PAID" as const,
    orderStatus: "WASHED" as const,
    paymentReference: "PAY-2026-002",
  };

  const [existingOrder2] = await db.select().from(orders).where(eq(orders.id, sampleOrder2.id)).limit(1);
  if (!existingOrder2) {
    await db.insert(orders).values(sampleOrder2);
    await db.insert(orderItems).values({
      id: "item_sample_03",
      orderId: sampleOrder2.id,
      serviceId: "serv_repaint",
      shoeBrand: "Converse",
      shoeModel: "Chuck 70 Vintage Canvas High",
      shoeColor: "Black / Egret",
      specialNotes: "Warna canvas hitam pudar karena matahari",
      price: 100000,
      beforeImageUrl: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
      afterImageUrl: null,
    });
  }

  console.log("🎉 Seeding completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
