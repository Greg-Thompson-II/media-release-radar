import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { MediaDetail } from "@/types/media";
import Calendar from "@/components/Calendar";
import TrackButton from "@/components/TrackButton";
import styles from "./page.module.scss";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  try {
    const media = await getMediaDetail(id);
    return { title: `${media.title} | Release Radar` };
  } catch {
    return { title: "Show Not Found | Release Radar" };
  }
}

async function getMediaDetail(id: string): Promise<MediaDetail> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/media/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch media detail: ${res.status}`);
  }

  return res.json() as Promise<MediaDetail>;
}

export default async function MediaDetailPage({ params }: Props) {
  const { id } = await params;
  const media = await getMediaDetail(id);

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        &larr; Back to all shows
      </Link>

      <div className={styles.hero}>
        <div className={styles.posterWrapper}>
          {media.coverImage !== null ? (
            <Image
              src={media.coverImage}
              alt={`Cover art for ${media.title}`}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className={styles.poster}
              unoptimized
            />
          ) : (
            <div className={styles.posterPlaceholder} />
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{media.title}</h1>

          {media.genres.length > 0 && (
            <ul className={styles.genres}>
              {media.genres.map((genre) => (
                <li key={genre} className={styles.genre}>
                  {genre}
                </li>
              ))}
            </ul>
          )}

          {media.networks.length > 0 && (
            <p className={styles.networks}>
              <span className={styles.label}>Network: </span>
              {media.networks.map((n) => n.name).join(", ")}
            </p>
          )}

          <p className={styles.stats}>
            {media.numberOfSeasons} season{media.numberOfSeasons !== 1 ? "s" : ""} &middot;{" "}
            {media.numberOfEpisodes} episode{media.numberOfEpisodes !== 1 ? "s" : ""}
          </p>

          {media.nextAiringEpisode !== null ? (
            <div className={styles.nextEpisode}>
              <span className={styles.label}>Next episode: </span>
              <span className={styles.episodeNumber}>
                Ep {media.nextAiringEpisode.episodeNumber}
              </span>
              <Calendar airDateUtc={media.nextAiringEpisode.airDateUtc} />
            </div>
          ) : (
            <p className={styles.noDate}>No upcoming episode scheduled</p>
          )}

          {media.overview !== null && media.overview !== "" && (
            <p className={styles.overview}>{media.overview}</p>
          )}

          <TrackButton mediaId={media.id} initialIsTracked={media.isTracked} />
        </div>
      </div>
    </main>
  );
}
