import styles from "./loading.module.scss";

// This file is automatically used by Next.js as a Suspense fallback
// while page.tsx awaits the backend fetch.
export default function Loading() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={`${styles.skeleton} ${styles.headingSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.subheadingSkeleton}`} />
      </header>

      <ul className={styles.grid} aria-label="Loading shows..." aria-busy="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i} className={styles.card}>
            <div className={styles.imageSkeleton} />
            <div className={styles.info}>
              <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.dateSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.buttonSkeleton}`} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
