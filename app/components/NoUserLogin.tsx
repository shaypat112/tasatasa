"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./NotUser.module.css";

type NotUserProps = {
  message?: string;
};

export default function NotUser({
  message = "You must be signed in for access with backend"
}: NotUserProps) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button
  className={styles.close}
  onClick={() => {
    setVisible(false);
    router.push("/NotFound");
  }}
  aria-label="Close"
>
  X
</button>


      <button
  onClick={() => router.push("/")}
  aria-label="Go home"
  style={{
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "#000",
    color: "#ffffff",
    border: "2px solid #ffffff",
    fontFamily: '"Press Start 2P", monospace',
    fontSize: "10px",
    padding: "6px 10px",
    cursor: "pointer",
    boxShadow: "2px 2px 0 #ffffff"
  }}
>
  HOME
</button>


        <h1 className={styles.title}>ACCESS DENIED</h1>
        <p className={styles.text}>{message}</p>
        <p className={styles.subtext}>Please sign in to continue.</p>
      </div>
    </div>
  );
}
