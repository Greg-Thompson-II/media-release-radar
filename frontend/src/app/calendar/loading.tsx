import styles from "./loading.module.scss";

const SECTION_SIZES = [2, 3, 2];

export default function Loading() {
  return (
    <main className={styles.main} aria-label="Loading calendar..." aria-busy="true">
      <header className={styles.header}>
        <div className={`${styles.skeleton} ${styles.headingSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.subheadingSkeleton}`} />
      </header>

      <div className={styles.agenda}>
        {SECTION_SIZES.map((count, si) => (
          <section key={si} className={styles.section}>
            <div className={`${styles.skeleton} ${styles.dateHeader}`} aria-hidden="true" />
            <ul className={styles.showList}>
              {Array.from({ length: count }).map((_, ri) => (
                <li key={ri} className={styles.showRow}>
                  <div className={styles.posterSkeleton} />
                  <div className={styles.showInfo}>
                    <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.metaSkeleton}`} />
                  </div>
                  <div className={`${styles.skeleton} ${styles.timeSkeleton}`} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
