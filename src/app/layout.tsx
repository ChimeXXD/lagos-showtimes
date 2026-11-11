import type { Metadata, Viewport } from "next";
import { pageColours } from "@/lib/theme/pageColours";
import "@/styles/globals.css";

const bg = pageColours();

export const metadata: Metadata = {
  title: "Sinima",
  description: "What's starting soon at Lagos cinemas, and should you stay after the credits?",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The browser bar takes the page colour.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: bg.light },
    { media: "(prefers-color-scheme: dark)", color: bg.dark },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
