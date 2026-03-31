"use client";

import { useState } from "react";
import type { MediaItem } from "@/types/media";
import MediaCard from "./MediaCard";
import styles from "./MediaGrid.module.scss";

interface MediaGridProps {
  mediaList: MediaItem[];
}

export default function MediaGrid({ mediaList }: MediaGridProps) {
  const [showOnlyTracked, setShowOnlyTracked] = useState(false);

  const displayList = showOnlyTracked
    ? mediaList.filter((media) => media.isTracked)
    : mediaList;

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button
          className={`${styles.toggle} ${!showOnlyTracked ? styles.active : ""}`}
          onClick={() => setShowOnlyTracked(false)}
          aria-pressed={!showOnlyTracked}
        >
          View All
        </button>
        <button
          className={`${styles.toggle} ${showOnlyTracked ? styles.active : ""}`}
          onClick={() => setShowOnlyTracked(true)}
          aria-pressed={showOnlyTracked}
        >
          My Watchlist
        </button>
      </div>

      {displayList.length === 0 ? (
        <p className={styles.empty}>
          {showOnlyTracked
            ? "You haven't tracked any shows yet."
            : "No releasing titles found. Run a sync to populate the database."}
        </p>
      ) : (
        <ul className={styles.grid} aria-label="Currently airing shows">
          {displayList.map((media) => (
            <li key={media.id} className={styles.item}>
              <MediaCard media={media} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
