"use client";

import { useRouter } from "next/navigation";
import styles from "@/app/media/[id]/page.module.scss";

export default function BackButton() {
  const router = useRouter();
  return (
    <button className={styles.back} onClick={() => router.back()}>
      &larr; Back
    </button>
  );
}
