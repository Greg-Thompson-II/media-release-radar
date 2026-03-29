import type { MediaItem } from "@/types/media";
import MediaGrid from "@/components/MediaGrid";
import styles from "./page.module.scss";

async function getReleasingMedia(): Promise<MediaItem[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/media`, {
    // No caching — we always want the latest data from the database
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch media: ${res.status}`);
  }

  return res.json() as Promise<MediaItem[]>;
}

export default async function Home() {
  const mediaList = await getReleasingMedia();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Currently Airing</h1>
        <p className={styles.subheading}>
          {mediaList.length} titles releasing this season
        </p>
      </header>

      <MediaGrid mediaList={mediaList} />
    </main>
  );
}
