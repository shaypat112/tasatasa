import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  openGraph: {
    title: "Retro Shift",
    description: "16 bit web game",
    images: [
      {
        url: "public/math.png",
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
    images: ["public/math.png"],
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
            {/* Sidebar */}
              




            {/* Main Area */}
            <div className="flex flex-col">
              {/* Header */}
          <header className="absolute top-2 left-2 z-50 ">
  <div className="flex items-center gap-2">
    
    <SignedOut>
      <SignInButton>
        <button className="retro-button text-xs px-2 py-1">
          SIGN IN
        </button>
      </SignInButton>

      <SignUpButton>
        <button className="retro-button text-xs px-2 py-1">
          SIGN UP
        </button>
      </SignUpButton>
    </SignedOut>

    <SignedIn>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 border",
          },
        }}
      />
    </SignedIn>
  </div>
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
