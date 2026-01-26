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
              


              <div className="mt-auto p-4 text-[10px] text-gray-500 text-center">
                AP PRECALC MODE
              </div>

            {/* Main Area */}
            <div className="flex flex-col">
              {/* Header */}
             <header className="h-14 px-6 flex items-center border-b-2 border-white">
  {/* Left spacer (keeps layout stable) */}
  <div className="flex-1" />

  {/* Auth area */}
  <div className="flex items-center gap-4">
    <SignedOut>
      <SignInButton />
      <SignUpButton>
        <button className="retro-button text-xs">
          SIGN UP
        </button>
      </SignUpButton>
    </SignedOut>

    <SignedIn>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10 border-2 border-white",
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
