export interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string; // ISO 8601 UTC string, e.g. "2026-03-29T14:00:00.000Z"
}

export interface MediaItem {
  id: string;
  aniListId: number;
  title: string;
  coverImage: string | null;
  status: string;
  nextAiringEpisode: MediaNextAiringEpisode | null;
}
