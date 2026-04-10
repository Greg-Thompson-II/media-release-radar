"use client";

import { useState, useEffect } from "react";
import styles from "./Calendar.module.scss";

interface CalendarProps {
  airDateUtc: string;
  hasExactTime: boolean;
}

export default function Calendar({ airDateUtc, hasExactTime }: CalendarProps) {
  const [localDate, setLocalDate] = useState<string>("");

  useEffect(() => {
    // Runs only in the browser — uses the user's local timezone automatically.
    // Initializing inside useEffect avoids server/client hydration mismatches
    // since Intl resolves differently per environment.
    const date = new Date(airDateUtc);
    const formatted = hasExactTime
      ? new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        }).format(date)
      : new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(date);
    setLocalDate(formatted);
  }, [airDateUtc, hasExactTime]);

  return (
    <time className={styles.airDate} dateTime={airDateUtc}>
      {localDate || "Loading..."}
    </time>
  );
}
