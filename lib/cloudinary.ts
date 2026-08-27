/**
 * Cloudinary Dynamic Transformation Engine
 * Generates 1:1 aspect ratio (1080x1080px) Before & After side-by-side stitched image URL
 * ready for Instagram Graph API Publishing.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

export interface StitchedImageOptions {
  beforeImageUrl: string;
  afterImageUrl: string;
  shoeBrand?: string;
  shoeModel?: string;
  serviceName?: string;
}

/**
 * Extracts public ID from a Cloudinary URL or returns a clean identifier
 */
export function extractPublicId(url: string): string {
  if (!url) return "sample";
  // If it's already a public ID
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url;
  }
  // If it's a Cloudinary URL
  const match = url.match(/\/v\d+\/([^\.\?]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback: encode URI component for remote fetch
  return encodeURIComponent(url);
}

/**
 * Generates Cloudinary Dynamic Transformation URL
 * Output: 1080x1080 px image with:
 * - Left 50% (540x1080): Before photo with "BEFORE" badge
 * - Right 50% (540x1080): After photo with "AFTER" badge
 * - Modern branding overlay footer
 */
export function buildStitchedImageUrl(options: StitchedImageOptions): string {
  const { beforeImageUrl, afterImageUrl, shoeBrand = "SNEAKER", shoeModel = "CARE" } = options;

  // If using local/external URLs in dev mode or mock mode
  if (!process.env.CLOUDINARY_API_KEY || CLOUD_NAME === "demo") {
    // Generate high-fidelity SVG/Canvas composite preview URL or direct comparison
    // When using demo/mock mode, we can use an SVG composite or Unsplash preview
    const title = encodeURIComponent(`${shoeBrand} ${shoeModel}`.toUpperCase());
    const beforeEnc = encodeURIComponent(beforeImageUrl || "");
    const afterEnc = encodeURIComponent(afterImageUrl || "");
    return `/api/media/stitch?before=${beforeEnc}&after=${afterEnc}&title=${title}`;
  }

  const beforeId = extractPublicId(beforeImageUrl);
  const afterId = extractPublicId(afterImageUrl).replace(/\//g, ":");

  // Cloudinary URL Transformation String:
  // 1. Base image (Before): width 540, height 1080, crop fill, gravity center, pad to 1080x1080 canvas aligned west
  // 2. Overlay image (After): layer afterId, width 540, height 1080, crop fill, gravity east
  // 3. Text overlays: "BEFORE" on top-left, "AFTER" on top-right
  // 4. Quality auto, format auto
  const transformations = [
    "c_fill,w_540,h_1080,g_center",
    "b_black,c_pad,w_1080,h_1080,g_west",
    `l_${afterId},c_fill,w_540,h_1080,g_east`,
    "l_text:Arial_36_bold_stroke:BEFORE,co_rgb:ffffff,bo_4px_solid_black,g_north_west,x_40,y_40",
    "l_text:Arial_36_bold_stroke:AFTER,co_rgb:ffffff,bo_4px_solid_black,g_north_east,x_40,y_40",
    "f_auto,q_auto",
  ].join("/");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${beforeId}.jpg`;
}
