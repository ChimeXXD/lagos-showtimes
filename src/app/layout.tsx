import type { Metadata, Viewport } from "next";
import { THEME_KEY } from "@/lib/area";
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

// A light or dark choice made with the header switch (D-58) is applied before the page is drawn, so
// the page never flashes the other theme, and the browser bar takes the kept colour as soon as the
// page is read (not only once React starts). With no choice, the page follows the phone.
const keptTheme = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark"){var c=${JSON.stringify(bg)}[t];document.documentElement.dataset.theme=t;document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=c})})}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script below may set data-theme before React takes over the page.
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: keptTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
