import styles from "./loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.backdropSkeleton} aria-hidden="true" />

      <main className={styles.main} aria-label="Loading show details..." aria-busy="true">
        <div className={`${styles.skeleton} ${styles.backSkeleton}`} />

        <div className={styles.hero}>
          <div className={styles.posterSkeleton} />

          <div className={styles.details}>
            <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />

            <div className={styles.genreRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.genreSkeleton}`} />
              ))}
            </div>

            <div className={`${styles.skeleton} ${styles.lineSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.lineSkeletonShort}`} />
            <div className={`${styles.skeleton} ${styles.lineSkeletonShort}`} />

            <div className={styles.overviewBlock}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.overviewLine}`} style={{ width: i === 3 ? "60%" : "100%" }} />
              ))}
            </div>

            <div className={`${styles.skeleton} ${styles.buttonSkeleton}`} />
          </div>
        </div>
      </main>
    </div>
  );
}
