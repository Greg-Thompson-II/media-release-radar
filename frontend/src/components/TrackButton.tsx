"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./TrackButton.module.scss";

interface TrackButtonProps {
  mediaId: string;
  initialIsTracked: boolean;
}

export default function TrackButton({ mediaId, initialIsTracked }: TrackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTracked, setIsTracked] = useState(initialIsTracked);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/watchlist`,
        {
          method: isTracked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId }),
        }
      );

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? "Request failed");
      }

      setIsTracked(!isTracked);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${isTracked ? styles.tracked : ""}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-label={isTracked ? "Untrack this show" : "Track this show"}
      >
        {isLoading ? "Loading..." : isTracked ? "Untrack" : "Track Show"}
      </button>
      {error !== null && <p className={styles.error}>{error}</p>}
    </div>
  );
}
