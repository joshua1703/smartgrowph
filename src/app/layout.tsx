import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartGrow — Smart Greenhouse Automation",
  description: "SmartGrow connects IoT sensors, automation, and real-time monitoring to help oyster mushroom growers maintain consistent growing conditions with less manual intervention.",
  metadataBase: new URL("https://smartgrow-ui.vercel.app"),
  openGraph: {
    title: "SmartGrow — Smart Greenhouse Automation",
    description: "IoT-based smart greenhouse monitoring system for oyster mushroom cultivation with ESP32, DHT22 sensors, and automated climate control.",
    url: "https://smartgrow-ui.vercel.app",
    siteName: "SmartGrow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-main.png",
        width: 1200,
        height: 630,
        alt: "SmartGrow — IoT Greenhouse Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartGrow — Smart Greenhouse Automation",
    description: "Real-time environmental monitoring for oyster mushroom cultivation with automated fan, fogger, and sprinkler control.",
    images: ["/og-main.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body
          className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}
          style={{ fontFamily: "var(--font-plus-jakarta), Plus Jakarta Sans, system-ui, sans-serif" }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="smartgrow-theme"
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster position="bottom-right" expand={false} visibleToasts={3} />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
