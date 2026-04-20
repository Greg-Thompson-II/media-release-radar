"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "@/app/layout.module.scss";

export default function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const watchlist = searchParams.get("watchlist") === "1";

  const isAllShows = pathname === "/" && !watchlist;
  const isWatchlist = pathname === "/" && watchlist;
  const isCalendar = pathname === "/calendar";

  return (
    <div className={styles.navLinks}>
      <Link href="/" className={`${styles.navLink} ${isAllShows ? styles.navLinkActive : ""}`}>
        All Shows
      </Link>
      <Link href="/?watchlist=1" className={`${styles.navLink} ${isWatchlist ? styles.navLinkActive : ""}`}>
        My Watchlist
      </Link>
      <Link href="/calendar" className={`${styles.navLink} ${isCalendar ? styles.navLinkActive : ""}`}>
        Calendar
      </Link>
    </div>
  );
}
