import Image from "next/image";
import type { MediaItem } from "@/types/media";
import Calendar from "./Calendar";
import TrackButton from "./TrackButton";
import styles from "./MediaCard.module.scss";

interface MediaCardProps {
  media: MediaItem;
}

export default function MediaCard({ media }: MediaCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {media.coverImage !== null ? (
          <Image
            src={media.coverImage}
            alt={`Cover art for ${media.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
            className={styles.image}
            unoptimized
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg
              className={styles.placeholderIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
            <span className={styles.placeholderLabel}>No Image</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h2 className={styles.title}>{media.title}</h2>

        {media.nextAiringEpisode !== null ? (
          <div className={styles.episode}>
            <span className={styles.episodeNumber}>
              Ep {media.nextAiringEpisode.episodeNumber}
            </span>
            <Calendar airDateUtc={media.nextAiringEpisode.airDateUtc} />
          </div>
        ) : (
          <p className={styles.noDate}>No upcoming episode</p>
        )}

        <TrackButton mediaId={media.id} initialIsTracked={media.isTracked} />
      </div>
    </article>
  );
}
