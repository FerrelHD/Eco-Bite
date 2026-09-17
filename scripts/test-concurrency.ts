import { PrismaClient } from "@prisma/client";
import { generateDynamicQRToken } from "../src/lib/qr-security";

const prisma = new PrismaClient();

async function runConcurrencyTest() {
  console.log("🧪 [TEST] Starting Concurrency & Anti-Double Booking Test...");

  // 1. Find or create merchant and student
  const merchant = await prisma.merchant.findFirst();
  const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });

  if (!merchant || !student) {
    throw new Error("Merchant or Student not found. Run db:seed first.");
  }

  // 2. Create a test surplus item with EXACTLY 2 portions left
  const testItem = await prisma.surplusItem.create({
    data: {
      merchantId: merchant.id,
      name: "⚡ Concurrency Test Mystery Bag",
      description: "Item uji coba persaingan checkout 1 porsi terakhir",
      category: "BAKERY",
      originalPrice: 30000,
      discountedPrice: 10000,
      stockQuantity: 2, // Only 2 portions available!
      version: 1,
      pickupStart: "19:30",
      pickupEnd: "21:00",
      byocBonusPoints: 50,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
      status: "AVAILABLE",
    },
  });

  console.log(`📦 Created test item with ID: ${testItem.id}, Stock: ${testItem.stockQuantity}`);
  console.log("🚀 Simulating 10 SIMULTANEOUS checkout requests for 1 portion each...");

  // Function simulating the exact atomic transaction logic from checkout route
  const simulateCheckoutAttempt = async (attemptIndex: number) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic decrement with condition stockQuantity >= 1
        const updated = await tx.surplusItem.updateMany({
          where: {
            id: testItem.id,
            stockQuantity: { gte: 1 },
            status: "AVAILABLE",
          },
          data: {
            stockQuantity: { decrement: 1 },
            version: { increment: 1 },
          },
        });

        if (updated.count === 0) {
          throw new Error("OUT_OF_STOCK");
        }

        // Check if now empty
        const current = await tx.surplusItem.findUnique({
          where: { id: testItem.id },
        });
        if (current && current.stockQuantity <= 0) {
          await tx.surplusItem.update({
            where: { id: testItem.id },
            data: { status: "SOLD_OUT" },
          });
        }

        // Create order
        const orderNumber = `#EB-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: student.id,
            merchantId: merchant.id,
            itemId: testItem.id,
            quantity: 1,
            totalPrice: 10000,
            paymentMethod: "QRIS",
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED",
          },
        });

        return order;
      });

      return { attemptIndex, success: true, orderId: result.id };
    } catch (err: any) {
      return { attemptIndex, success: false, error: err.message };
    }
  };

  // Launch 10 simultaneous promises
  const attempts = Array.from({ length: 10 }, (_, i) => simulateCheckoutAttempt(i + 1));
  const results = await Promise.all(attempts);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n📊 --- HASIL SIMULASI CONCURRENCY ---");
  console.log(`✅ Pesanan Berhasil: ${successful.length}`);
  console.log(`❌ Pesanan Ditolak (Habis): ${failed.length}`);

  // Check final stock in DB
  const finalItem = await prisma.surplusItem.findUnique({ where: { id: testItem.id } });
  console.log(`📦 Sisa Stok Terakhir di Database: ${finalItem?.stockQuantity}, Status: ${finalItem?.status}`);

  // Clean up test item
  await prisma.order.deleteMany({ where: { itemId: testItem.id } });
  await prisma.surplusItem.delete({ where: { id: testItem.id } });

  // Verification Assertion
  if (successful.length === 2 && failed.length === 8 && finalItem?.stockQuantity === 0) {
    console.log("\n🎉 [PASS] Concurrency Protection BERHASIL 100%! Tidak ada double-booking.");
  } else {
    console.error("\n💥 [FAIL] Terjadi race condition atau double-booking!");
    process.exit(1);
  }
}

runConcurrencyTest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
