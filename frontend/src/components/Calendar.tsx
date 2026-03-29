"use client";

import { useState, useEffect } from "react";
import styles from "./Calendar.module.scss";

interface CalendarProps {
  airDateUtc: string;
}

export default function Calendar({ airDateUtc }: CalendarProps) {
  const [localDate, setLocalDate] = useState<string>("");

  useEffect(() => {
    // Runs only in the browser — uses the user's local timezone automatically.
    // Initializing inside useEffect avoids server/client hydration mismatches
    // since Intl resolves differently per environment.
    setLocalDate(
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
      }).format(new Date(airDateUtc))
    );
  }, [airDateUtc]);

  return (
    <time className={styles.airDate} dateTime={airDateUtc}>
      {localDate || "Loading..."}
    </time>
  );
}
