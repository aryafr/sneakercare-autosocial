import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const beforeUrl = searchParams.get("before") || "";
  const afterUrl = searchParams.get("after") || "";
  const title = (searchParams.get("title") || "SNEAKER TREATMENT").toUpperCase();

  // Generate dynamic 1080x1080 SVG canvas with side-by-side comparison and SO CLEAN branding
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <clipPath id="leftHalf">
          <rect x="0" y="0" width="538" height="1080" />
        </clipPath>
        <clipPath id="rightHalf">
          <rect x="542" y="0" width="538" height="1080" />
        </clipPath>
        <linearGradient id="overlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="50%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(15,23,42,0.85)" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1080" height="1080" fill="#0f172a" />

      <!-- Left Image (BEFORE) -->
      ${
        beforeUrl
          ? `<image href="${beforeUrl}" x="0" y="0" width="538" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#leftHalf)" />`
          : `<rect x="0" y="0" width="538" height="1080" fill="#1e293b" /><text x="270" y="540" fill="#64748b" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">NO BEFORE PHOTO</text>`
      }

      <!-- Right Image (AFTER) -->
      ${
        afterUrl
          ? `<image href="${afterUrl}" x="542" y="0" width="538" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#rightHalf)" />`
          : `<rect x="542" y="0" width="538" height="1080" fill="#0f172a" /><text x="810" y="540" fill="#64748b" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">TREATMENT IN PROGRESS</text>`
      }

      <!-- Center Divider Line -->
      <line x1="540" y1="0" x2="540" y2="1080" stroke="#ffffff" stroke-width="4" />

      <!-- Bottom Gradient Overlay -->
      <rect x="0" y="0" width="1080" height="1080" fill="url(#overlayGrad)" />

      <!-- Top Header Brand Badge -->
      <rect x="36" y="36" width="340" height="52" rx="26" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" stroke-width="1.5" />
      <text x="206" y="69" fill="#ffffff" font-family="system-ui, sans-serif" font-size="17" font-weight="900" text-anchor="middle" letter-spacing="1">HOMECLEANING_SHOES</text>

      <!-- BEFORE Tag -->
      <rect x="440" y="36" width="110" height="52" rx="12" fill="#ef4444" />
      <text x="495" y="69" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1">BEFORE</text>

      <!-- AFTER Tag -->
      <rect x="570" y="36" width="110" height="52" rx="12" fill="#10b981" />
      <text x="625" y="69" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1">AFTER</text>

      <!-- Footer Brand Watermark -->
      <rect x="36" y="964" width="1008" height="80" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="#1e293b" stroke-width="1" />
      <text x="64" y="1014" fill="#ffffff" font-family="system-ui, sans-serif" font-size="24" font-weight="900">${title}</text>
      <text x="1016" y="1014" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="end">@homecleaning_shoes</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
