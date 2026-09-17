import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateDynamicQRToken } from "../src/lib/qr-security";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning up existing records...");
  await prisma.ecoImpactLog.deleteMany();
  await prisma.rescuePass.deleteMany();
  await prisma.order.deleteMany();
  await prisma.surplusItem.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.campusFacility.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync("ecobite123", 10);

  console.log("🌱 Creating initial users...");
  // 1. Student User
  const student = await prisma.user.create({
    data: {
      email: "mahasiswa@ecobite.ac.id",
      passwordHash,
      role: "STUDENT",
      name: "Rian Pratama",
      nim: "2206819283",
      faculty: "Fakultas Teknik",
      ecoPoints: 1250,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Merchant User
  const merchantUser = await prisma.user.create({
    data: {
      email: "kulina@ecobite.ac.id",
      passwordHash,
      role: "MERCHANT",
      name: "Chef Budi Santoso",
      nim: "STF-9921",
      faculty: "Vokasi",
      ecoPoints: 340,
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ecobite.ac.id",
      passwordHash,
      role: "ADMIN",
      name: "Dr. Siti Rahmawati",
      nim: "DSN-1044",
      faculty: "Kantor Keberlanjutan Kampus",
      ecoPoints: 9999,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("🌱 Creating merchants...");
  const kulinaMerchant = await prisma.merchant.create({
    data: {
      userId: merchantUser.id,
      storeName: "Kulina Bakery & Pastry",
      location: "Gedung Vokasi Lt. 1",
      faculty: "Vokasi",
      isOpen: true,
      isVerified: true,
      greenTier: "GOLD",
      bannerUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
      coordinatesLat: -6.3628,
      coordinatesLng: 106.8285,
    },
  });

  const febMerchant = await prisma.merchant.create({
    data: {
      userId: adminUser.id,
      storeName: "Kantin Dallas FEB",
      location: "Kantin Pusat FEB Lt. Dasar",
      faculty: "FEB",
      isOpen: true,
      isVerified: true,
      greenTier: "SILVER",
      bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
      coordinatesLat: -6.3605,
      coordinatesLng: 106.831,
    },
  });

  const pusgiwaMerchant = await prisma.merchant.create({
    data: {
      userId: adminUser.id,
      storeName: "Kafe Pusgiwa & Salad Bar",
      location: "Pusat Kegiatan Mahasiswa Lt. 2",
      faculty: "Pusgiwa",
      isOpen: true,
      isVerified: true,
      greenTier: "GOLD",
      bannerUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80",
      coordinatesLat: -6.3645,
      coordinatesLng: 106.8298,
    },
  });

  console.log("🌱 Creating surplus items...");
  const mysteryBag = await prisma.surplusItem.create({
    data: {
      merchantId: kulinaMerchant.id,
      name: "Surplus Mystery Bag (Pastry & Bread)",
      description: "1 kantong berisi 3-4 aneka pastry artisanal, croissant butter, dan bun manis segar yang dipanggang hari ini.",
      category: "BAKERY",
      originalPrice: 35000,
      discountedPrice: 15000,
      stockQuantity: 3,
      version: 1,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  const sourdough = await prisma.surplusItem.create({
    data: {
      merchantId: kulinaMerchant.id,
      name: "Artisan Sourdough Loaf",
      description: "Roti sourdough ragi alami utuh bernutrisi tinggi dengan kerak renyah, sempurna untuk sarapan esok hari.",
      category: "BAKERY",
      originalPrice: 42000,
      discountedPrice: 16000,
      stockQuantity: 2,
      version: 1,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  await prisma.surplusItem.create({
    data: {
      merchantId: kulinaMerchant.id,
      name: "Chilled Combo Box Pastry",
      description: "2x Butter Croissant + 1x Cinnamon Roll manis dengan selai buah organik.",
      category: "BAKERY",
      originalPrice: 30000,
      discountedPrice: 12000,
      stockQuantity: 4,
      version: 1,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  await prisma.surplusItem.create({
    data: {
      merchantId: febMerchant.id,
      name: "Rice Bowl Ayam Suwir Sambal Matah",
      description: "Nasi pulen hangat dengan porsi ayam suwir gurih, lalap segar, dan sambal matah harum.",
      category: "RICE_MAINS",
      originalPrice: 28000,
      discountedPrice: 13000,
      stockQuantity: 2,
      version: 1,
      pickupStart: "19:00",
      pickupEnd: "20:30",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  await prisma.surplusItem.create({
    data: {
      merchantId: pusgiwaMerchant.id,
      name: "Cold Brew Oat Latte & Chia Bowl",
      description: "Cold brew kopi arabika susu oat rendah gula dipadukan dengan chia pudding buah segar.",
      category: "CAFE_COFFEE",
      originalPrice: 38000,
      discountedPrice: 16000,
      stockQuantity: 3,
      version: 1,
      pickupStart: "20:00",
      pickupEnd: "21:30",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  await prisma.surplusItem.create({
    data: {
      merchantId: pusgiwaMerchant.id,
      name: "Green Garden Detox Salad",
      description: "Selada romaine hidroponik kebun kampus, tomat ceri, edamame, dan saus roasted sesame.",
      category: "HEALTHY_SALAD",
      originalPrice: 32000,
      discountedPrice: 14000,
      stockQuantity: 1,
      version: 1,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      status: "AVAILABLE",
    },
  });

  console.log("🌱 Creating active sample order (#EB-88492)...");
  const activeOrder = await prisma.order.create({
    data: {
      orderNumber: "#EB-88492",
      userId: student.id,
      merchantId: kulinaMerchant.id,
      itemId: mysteryBag.id,
      quantity: 1,
      totalPrice: 15000,
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      byocOptIn: true,
      byocVerified: false,
    },
  });

  // Generate dynamic QR token
  const qrToken = generateDynamicQRToken(activeOrder.id, activeOrder.orderNumber);

  // Set expiration to 45 minutes from now
  const expiresAt = new Date(Date.now() + 45 * 60 * 1000);

  await prisma.rescuePass.create({
    data: {
      orderId: activeOrder.id,
      qrSecret: "secret-key",
      dynamicQrToken: qrToken,
      expiresAt: expiresAt,
      status: "ACTIVE",
    },
  });

  console.log("🌱 Creating historical impact logs for student...");
  // Sample completed order 1
  const completedOrder1 = await prisma.order.create({
    data: {
      orderNumber: "#EB-71024",
      userId: student.id,
      merchantId: kulinaMerchant.id,
      itemId: sourdough.id,
      quantity: 1,
      totalPrice: 16000,
      paymentMethod: "KAMPUSPAY",
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
      byocOptIn: true,
      byocVerified: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.ecoImpactLog.create({
    data: {
      userId: student.id,
      orderId: completedOrder1.id,
      foodWeightKg: 0.65,
      co2SavedKg: 1.3,
      moneySavedRp: 26000,
      pointsAwarded: 100, // 50 rescue + 50 BYOC
    },
  });

  console.log("🌱 Creating campus facilities...");
  const facilities = [
    {
      name: "Kulina Bakery & Pastry",
      type: "SURPLUS_MERCHANT",
      lat: -6.3628,
      lng: 106.8285,
      details: "Buka 19:30 - 21:00 • Sisa 9 porsi",
    },
    {
      name: "Kantin Dallas FEB",
      type: "SURPLUS_MERCHANT",
      lat: -6.3605,
      lng: 106.831,
      details: "Buka 19:00 - 20:30 • Sisa 2 porsi",
    },
    {
      name: "Kafe Pusgiwa & Salad Bar",
      type: "SURPLUS_MERCHANT",
      lat: -6.3645,
      lng: 106.8298,
      details: "Buka 20:00 - 21:30 • Sisa 4 porsi",
    },
    {
      name: "Drop Box Wadah Reusable Vokasi",
      type: "REUSABLE_DROP",
      lat: -6.3624,
      lng: 106.8282,
      details: "Titik pengembalian wadah ramah lingkungan kampus",
    },
    {
      name: "Drop Box Wadah Reusable Perpustakaan",
      type: "REUSABLE_DROP",
      lat: -6.3615,
      lng: 106.8302,
      details: "Drop point kotak makan steril 24 jam",
    },
    {
      name: "Water Station Refill Pusgiwa",
      type: "WATER_STATION",
      lat: -6.3642,
      lng: 106.8301,
      details: "Stasiun air minum gratis bawa tumbler",
    },
    {
      name: "Parkir Sepeda Hijau FT UI",
      type: "BIKE_PARKING",
      lat: -6.3618,
      lng: 106.8265,
      details: "Fasilitas parkir sepeda kampus terintegrasi",
    },
  ];

  for (const fac of facilities) {
    await prisma.campusFacility.create({ data: fac });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
