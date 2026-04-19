import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import styles from "./page.module.scss";

export interface CalendarItem {
  id: string;
  media: {
    title: string;
    coverImage: string | null;
    network: string | null;
  };
  nextAiringEpisode: {
    episodeNumber: number;
    airDateUtc: string;
    hasExactTime: boolean;
  };
}

async function getCalendar(): Promise<CalendarItem[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (token === null) return [];

  const res = await fetch(`${process.env.BACKEND_URL}/api/calendar`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch calendar: ${res.status}`);
  }

  return res.json() as Promise<CalendarItem[]>;
}

export default async function CalendarPage() {
  const items = await getCalendar();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.heading}>My Calendar</h1>
        <p className={styles.subheading}>
          Upcoming episodes from{" "}
          <Link href="/?watchlist=1" className={styles.watchlistLink}>your watchlist</Link>
        </p>
      </header>
      <CalendarView items={items} />
    </main>
  );
}
