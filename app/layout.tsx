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
  title: "Dune Parodox II",
  description: "16 bit web math game",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Dune Paradox II",
    description: "16 bit web game",
    images: [
      {
        url: "/math.png",
        width: 1200,
        height: 630,
        alt: "Dune Parodox II  Retron styled Math Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dune Paradox II",
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
        <body className="app-body">
          <div className="app-grid">
            <div className="app-sidebar" />

            <div className="app-main">
              <header className="app-auth">
                <AuthGate />
              </header>

              <main className="app-content">{children}</main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
