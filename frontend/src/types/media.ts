export interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string; // ISO 8601 UTC string, e.g. "2026-03-29T14:00:00.000Z"
  hasExactTime: boolean; // true = TVMaze airstamp, false = noon UTC fallback (date only)
}

export interface MediaItem {
  id: string;
  tmdbId: number;
  title: string;
  coverImage: string | null;
  network: string | null;
  networkLogoUrl: string | null;
  status: string;
  isTracked: boolean;
  nextAiringEpisode: MediaNextAiringEpisode | null;
}

export interface MediaNetwork {
  name: string;
  logoUrl: string | null;
}

export interface MediaDetail extends MediaItem {
  overview: string | null;
  genres: string[];
  networks: MediaNetwork[];
  numberOfSeasons: number;
  numberOfEpisodes: number;
}
