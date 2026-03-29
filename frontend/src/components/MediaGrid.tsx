import type { MediaItem } from "@/types/media";
import MediaCard from "./MediaCard";
import styles from "./MediaGrid.module.scss";

interface MediaGridProps {
  mediaList: MediaItem[];
}

export default function MediaGrid({ mediaList }: MediaGridProps) {
  if (mediaList.length === 0) {
    return (
      <p className={styles.empty}>
        No releasing titles found. Run a sync to populate the database.
      </p>
    );
  }

  return (
    <ul className={styles.grid} aria-label="Currently airing shows">
      {mediaList.map((media) => (
        <li key={media.id} className={styles.item}>
          <MediaCard media={media} />
        </li>
      ))}
    </ul>
  );
}
