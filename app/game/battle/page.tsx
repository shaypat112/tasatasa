import { Suspense } from "react";
import BattleClient from "./BattleClient";

export default function BattlePage() {
  return (
    <Suspense fallback={<div>Loading battle...</div>}>
      <BattleClient />
    </Suspense>
  );
}
