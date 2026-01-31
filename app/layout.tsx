import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import AuthGate from "./components/AuthGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retro Shift",
  description: "16 bit web game",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Retro Shift",
    description: "16 bit web game",
    images: [
      {
        url: "/math.png",
        width: 1200,
        height: 630,
        alt: "RetroShift AP Precalculus Retro Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retro Shift",
    description: "16 bit web game",
    images: ["/math.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-black text-white`}
        >
          <div className="grid grid-cols-[220px_1fr] min-h-screen">
            {/* Sidebar (future) */}
            <div />

            {/* Main Area */}
            <div className="flex flex-col">
              {/* Header */}
              <header className="absolute top-2 left-2 z-50">
                <AuthGate />
              </header>

              {/* Content */}
              <main className="flex-1 flex items-center justify-center p-6">
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
