"use client";

import { useUser } from "@clerk/nextjs";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "rooms", "global", "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, "rooms", "global", "messages"), {
      text: text.trim(),
      userId: user.id,
      username: user.username || user.firstName || "Player",
      roomId: "global",
      type: "chat",
      edited: false,
      createdAt: serverTimestamp(),
    });

    setText("");
  }

  if (!isLoaded) {
    return <p style={{ padding: 24 }}>Loading chat...</p>;
  }

  if (!user) {
    return <p style={{ padding: 24 }}>Sign in to use chat.</p>;
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: '"Press Start 2P", monospace',
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <h1 style={{ marginBottom: 12 }}>USER CHAT</h1>

      <div
        style={{
          flex: 1,
          border: "4px solid #3a3a3a",
          padding: 12,
          overflowY: "auto",
          background: "#0a0a0a",
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <span style={{ color: "#fff" }}>{m.username}</span>
            <span style={{ color: "#777" }}>:</span>{" "}
            <span style={{ color: "#00ff9c" }}>{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
          style={{
            flex: 1,
            background: "#000",
            border: "3px solid #3a3a3a",
            color: "#00ff9c",
            padding: 10,
            fontFamily: '"Press Start 2P", monospace',
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            border: "3px solid #3a3a3a",
            background: "#111",
            color: "#00ff9c",
            padding: "10px 16px",
            fontFamily: '"Press Start 2P", monospace',
            cursor: "pointer",
          }}
        >
          SEND
        </button>
        <button onClick={() => router.push("/")}>Home</button>
      </div>
    </div>
  );
}
