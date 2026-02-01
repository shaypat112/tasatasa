import { Suspense } from "react";
import BattleClient from "./BattleClient";
import styles from "./page.module.css";

export default function BattlePage() {
  return (
    <Suspense fallback={<div>Loading battle...</div>}>
      <BattleClient />
    </Suspense>
  );
}
