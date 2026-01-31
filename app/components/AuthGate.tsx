"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function AuthGate() {
  const { isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
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
  );
}
