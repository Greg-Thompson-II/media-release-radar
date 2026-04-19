"use client";

import Image from "next/image";
import Link from "next/link";
import type { CalendarItem } from "@/app/calendar/page";
import styles from "@/app/calendar/page.module.scss";

interface GroupedShows {
  dateKey: string;
  label: string;
  shows: CalendarItem[];
}

function groupByLocalDate(shows: CalendarItem[]): GroupedShows[] {
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const map = new Map<string, GroupedShows>();

  for (const show of shows) {
    const date = new Date(show.nextAiringEpisode.airDateUtc);
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

export default function CalendarView({ items }: { items: CalendarItem[] }) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No upcoming episodes yet.</p>
        <Link href="/?watchlist=1" className={styles.emptyStateLink}>
          Browse shows to add to your watchlist &rarr;
        </Link>
      </div>
    );
  }

  const groups = groupByLocalDate(items);

  return (
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
                        Ep {show.nextAiringEpisode.episodeNumber}
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
  );
}
