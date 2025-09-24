import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "NullBin - Privacy-first encrypted pastebin",
  description: "Secure, client-side encrypted pastebin. No accounts, no tracking, auto-expiry.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/nullbin-logo.png",
        color: "#000000",
      },
    ],
  },
  openGraph: {
    title: "NullBin - Privacy-first encrypted pastebin",
    description: "Secure, client-side encrypted pastebin. No accounts, no tracking, auto-expiry.",
    images: [
      {
        url: "/nullbin-logo.png",
        width: 1200,
        height: 630,
        alt: "NullBin Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NullBin - Privacy-first encrypted pastebin",
    description: "Secure, client-side encrypted pastebin. No accounts, no tracking, auto-expiry.",
    images: ["/nullbin-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
