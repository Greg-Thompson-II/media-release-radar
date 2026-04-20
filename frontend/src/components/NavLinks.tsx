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

  const links = [
    { href: "/", label: "All Shows", active: isAllShows },
    { href: "/?watchlist=1", label: "My Watchlist", active: isWatchlist },
    { href: "/calendar", label: "Calendar", active: isCalendar },
  ];

  return (
    <>
      <div className={styles.navLinks}>
        {links.map(({ href, label, active }) => (
          <Link key={href} href={href} className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}>
            {label}
          </Link>
        ))}
      </div>

      <nav className={styles.bottomNav} aria-label="Primary navigation">
        {links.map(({ href, label, active }) => (
          <Link key={href} href={href} className={`${styles.bottomNavLink} ${active ? styles.bottomNavLinkActive : ""}`}>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
