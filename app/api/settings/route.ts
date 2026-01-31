import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type SettingsPayload = {
  mathMode: string;
  showHints: boolean;
  timerEnabled: boolean;
  soundEnabled: boolean;
  difficultySpeed: "slow" | "normal" | "fast";
};

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SettingsPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    mathMode,
    showHints,
    timerEnabled,
    soundEnabled,
    difficultySpeed,
  } = body;

  if (!mathMode) {
    return NextResponse.json({ error: "Missing mathMode" }, { status: 400 });
  }

  const client = await clerkClient();

  await client.users.updateUser(userId, {
    publicMetadata: {
      mathMode,
      showHints,
      timerEnabled,
      soundEnabled,
      difficultySpeed,
    },
  });

  return NextResponse.json({ success: true });
}
