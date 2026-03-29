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
          <div className={styles.imagePlaceholder} aria-hidden="true" />
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

        <TrackButton mediaId={media.id} />
      </div>
    </article>
  );
}
