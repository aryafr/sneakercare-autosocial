import type { Metadata } from "next";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: "homecleaning_shoes | Professional Shoe Laundry & Portfolio Engine",
  description:
    "Web platform terpadu untuk operasional jasa laundry sepatu: booking online, tracking resi real-time, dan otomasi publikasi Before/After ke Instagram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextTopLoader color="#0ea5e9" height={3} showSpinner={false} />
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
