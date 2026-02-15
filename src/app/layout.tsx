import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Honey - Собирай нектар, зарабатывай криптовалюту!",
  description: "Telegram Mini App игра в жанре match-3. Собирай нектар, создавай комбинации и обменивай на реальные криптовалютные токены MED!",
  keywords: ["Honey", "Telegram", "Mini App", "match-3", "игра", "криптовалюта", "MED"],
  authors: [{ name: "Honey Game" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Honey - Match-3 Game",
    description: "Собирай нектар, зарабатывай криптовалюту!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#92400e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          background: 'linear-gradient(to bottom right, #1c1917, #451a03, #1c1917)',
          minHeight: '100vh',
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
