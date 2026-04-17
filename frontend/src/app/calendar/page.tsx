"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";

// ---------------------------------------------------------------------------
// Mock data — Phase 4 placeholder until the real API endpoint is wired up
// ---------------------------------------------------------------------------

function daysFromNow(days: number, hour = 20, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

interface MockShow {
  id: string;
  media: {
    title: string;
    coverImage: string | null;
    network: string | null;
  };
  nextAiringEpisode: {
    episodeNumber: number;
    seasonNumber: number;
    hasExactTime: boolean;
    airDateUtc: string;
  };
}

const MOCK_TRACKED: MockShow[] = [
  {
    id: "1",
    media: { title: "Severance", coverImage: null, network: "Apple TV+" },
    nextAiringEpisode: {
      episodeNumber: 6,
      seasonNumber: 2,
      hasExactTime: true,
      airDateUtc: daysFromNow(0, 20, 0), // today 8 PM UTC
    },
  },
  {
    id: "2",
    media: { title: "The Last of Us", coverImage: null, network: "HBO" },
    nextAiringEpisode: {
      episodeNumber: 4,
      seasonNumber: 2,
      hasExactTime: true,
      airDateUtc: daysFromNow(0, 22, 0), // today 10 PM UTC
    },
  },
  {
    id: "3",
    media: { title: "Andor", coverImage: null, network: "Disney+" },
    nextAiringEpisode: {
      episodeNumber: 9,
      seasonNumber: 2,
      hasExactTime: true,
      airDateUtc: daysFromNow(1, 21, 0), // tomorrow 9 PM UTC
    },
  },
  {
    id: "4",
    media: { title: "The Bear", coverImage: null, network: "Hulu" },
    nextAiringEpisode: {
      episodeNumber: 1,
      seasonNumber: 4,
      hasExactTime: false,
      airDateUtc: daysFromNow(3, 12, 0), // 3 days out, date-only
    },
  },
  {
    id: "5",
    media: { title: "Shōgun", coverImage: null, network: "FX" },
    nextAiringEpisode: {
      episodeNumber: 3,
      seasonNumber: 2,
      hasExactTime: true,
      airDateUtc: daysFromNow(5, 22, 0), // 5 days out
    },
  },
];

// ---------------------------------------------------------------------------
// Grouping helper
// ---------------------------------------------------------------------------

interface GroupedShows {
  dateKey: string;   // ISO date string used for sorting/keying
  label: string;     // e.g. "Thursday, April 17"
  shows: MockShow[];
}

function groupByLocalDate(shows: MockShow[]): GroupedShows[] {
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const map = new Map<string, GroupedShows>();

  for (const show of shows) {
    const date = new Date(show.nextAiringEpisode.airDateUtc);
    // Key by local calendar date (YYYY-MM-DD equivalent via locale-stable parts)
    const parts = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const y = parts.find((p) => p.type === "year")?.value ?? "";
    const m = parts.find((p) => p.type === "month")?.value ?? "";
    const d = parts.find((p) => p.type === "day")?.value ?? "";
    const dateKey = `${y}-${m}-${d}`;

    if (!map.has(dateKey)) {
      map.set(dateKey, { dateKey, label: dayFormatter.format(date), shows: [] });
    }
    map.get(dateKey)!.shows.push(show);
  }

  return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(isoString));
}

function isToday(isoString: string): boolean {
  const today = new Date();
  const d = new Date(isoString);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const groups = groupByLocalDate(MOCK_TRACKED);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.heading}>My Calendar</h1>
        <p className={styles.subheading}>Upcoming episodes from your watchlist</p>
      </header>

      <div className={styles.agenda}>
        {groups.map((group) => {
          const todayGroup = isToday(group.shows[0].nextAiringEpisode.airDateUtc);
          return (
            <section key={group.dateKey} className={styles.section}>
              <div className={styles.dateHeader}>
                <h2 className={styles.dateLabel}>{group.label}</h2>
                {todayGroup && <span className={styles.todayBadge}>Today</span>}
              </div>
              <ul className={styles.showList}>
                {group.shows.map((show) => (
                  <li key={show.id}>
                    <Link href={`/media/${show.id}`} className={styles.showRow}>
                      <div className={styles.posterWrapper}>
                        {show.media.coverImage !== null ? (
                          <Image
                            src={show.media.coverImage}
                            alt={`Poster for ${show.media.title}`}
                            fill
                            className={styles.poster}
                            unoptimized
                          />
                        ) : (
                          <div className={styles.posterPlaceholder} aria-hidden="true" />
                        )}
                      </div>

                      <div className={styles.showInfo}>
                        <span className={styles.showTitle}>{show.media.title}</span>
                        <span className={styles.episodeMeta}>
                          S{show.nextAiringEpisode.seasonNumber} &middot; Ep{" "}
                          {show.nextAiringEpisode.episodeNumber}
                          {show.media.network !== null && (
                            <> &middot; {show.media.network}</>
                          )}
                        </span>
                      </div>

                      <div className={styles.timeBlock}>
                        {show.nextAiringEpisode.hasExactTime ? (
                          <span className={styles.airTime}>
                            {formatTime(show.nextAiringEpisode.airDateUtc)}
                          </span>
                        ) : (
                          <span className={styles.airTimeUnknown}>Time TBA</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
