import { generateDynamicQRToken, verifyDynamicQRToken } from "../src/lib/qr-security";

function runQRSecurityTest() {
  console.log("🧪 [TEST] Starting Dynamic QR HMAC-SHA256 Security Test...\n");

  const orderId = "ord_test_99210";
  const orderNumber = "#EB-88492";

  // 1. Generate legitimate token
  console.log("1. Generating legitimate dynamic QR token...");
  const validToken = generateDynamicQRToken(orderId, orderNumber);
  console.log(`   Token generated: ${validToken}`);

  // Verify valid token
  const validCheck = verifyDynamicQRToken(validToken);
  console.log("   Verification result:", validCheck);

  if (!validCheck.valid || validCheck.orderNumber !== orderNumber) {
    throw new Error("FAIL: Valid token failed verification!");
  }
  console.log("   ✅ Valid token verification PASSED.\n");

  // 2. Tampering test: Attacker modifies orderNumber or orderId
  console.log("2. Simulating tampering attack (signature forgery)...");
  const tamperedToken = validToken.replace(orderNumber, "#EB-99999");
  const tamperedCheck = verifyDynamicQRToken(tamperedToken);
  console.log("   Tampered token verification result:", tamperedCheck);

  if (tamperedCheck.valid) {
    throw new Error("FAIL: Tampered token was unexpectedly accepted!");
  }
  console.log("   ✅ Tampered token successfully REJECTED.\n");

  // 3. Expiration test
  console.log("3. Simulating expired QR code...");
  // Test with maxAgeMs = 0 to trigger expiration
  const expiredCheck = verifyDynamicQRToken(validToken, -1000);
  console.log("   Expired token verification result:", expiredCheck);

  if (expiredCheck.valid || !expiredCheck.expired) {
    throw new Error("FAIL: Expired token was unexpectedly accepted!");
  }
  console.log("   ✅ Expired token successfully REJECTED.\n");

  console.log("🎉 [PASS] Semua uji kriptografi QR Code & Anti-Tampering BERHASIL 100%!");
}

runQRSecurityTest();
