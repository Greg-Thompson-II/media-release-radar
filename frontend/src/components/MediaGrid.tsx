"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MediaItem } from "@/types/media";
import MediaCard from "./MediaCard";
import styles from "./MediaGrid.module.scss";

interface MediaGridProps {
  mediaList: MediaItem[];
}

export default function MediaGrid({ mediaList }: MediaGridProps) {
  const searchParams = useSearchParams();
  const showOnlyTracked = searchParams.get("watchlist") === "1";
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const displayList = mediaList.filter((media) => {
    const matchesFilter = showOnlyTracked ? media.isTracked : true;
    const matchesSearch =
      normalizedQuery === "" ||
      media.title.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search shows"
        />
      </div>

      {displayList.length === 0 ? (
        <p className={styles.empty}>
          {normalizedQuery !== ""
            ? `No results for "${query}".`
            : showOnlyTracked
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
