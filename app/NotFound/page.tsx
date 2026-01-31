"use client";

import Link from "next/link";
import styles from "./NotFound.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.screen}>
      <div className={styles.window}>
        <h1 className={styles.code}>404</h1>

        <p className={styles.title}>PAGE NOT FOUND</p>

        <p className={styles.description}>
          You have reached an area outside the map.
          <br />
          There is nothing to explore here. 
          <br/>
         <i> <b> Go back home and sign in </b> </i>
        </p>

        <div className={styles.actions}>
          <Link href="/">
            <button className={styles.primary}>
              RETURN HOME
            </button>
          </Link>

          <button
            className={styles.secondary}
            onClick={() => window.history.back()}
          >
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}
