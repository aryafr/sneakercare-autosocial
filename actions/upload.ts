"use server";

/**
 * Cloudinary Direct Upload Signature Generator
 * Generates signed parameters for client-side direct upload without exposing API secret.
 */
export async function getCloudinarySignedUploadParams(folder: string = "sneakercare") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const timestamp = Math.round(new Date().getTime() / 1000);

  // If no Cloudinary API Secret is provided (local dev / demo mode)
  if (!apiSecret || !apiKey || cloudName === "demo") {
    return {
      cloudName: "demo",
      apiKey: "mock_api_key",
      timestamp,
      folder,
      signature: "mock_signature",
      isMock: true,
    };
  }

  // Cloudinary signature string format: params sorted alphabetically and joined with & then secret appended
  const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  // Web Crypto SHA-1 hash for Cloudinary signature
  const enc = new TextEncoder();
  const data = enc.encode(strToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    isMock: false,
  };
}
