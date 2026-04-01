import "dotenv/config";

// --- Types ---

export interface TMDBNextEpisode {
  episode_number: number;
  air_date: string; // "YYYY-MM-DD" date string only, no time component
}

export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TMDBShowDetail {
  id: number;
  name: string;
  poster_path: string | null;
  status: string;
  next_episode_to_air: TMDBNextEpisode | null;
  networks: TMDBNetwork[];
}

interface TMDBListShow {
  id: number;
}

interface TMDBOnAirResponse {
  page: number;
  total_pages: number;
  results: TMDBListShow[];
}

// --- Constants ---

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w154";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
// Delay between individual show detail calls to respect rate limits (~40 req/10s)
const DETAIL_DELAY_MS = 250;
// Delay between on_the_air list pages
const PAGE_DELAY_MS = 250;

// --- Helpers ---

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 10_000;
        console.warn(`TMDB rate limit hit. Waiting ${waitMs}ms before retry.`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`TMDB API returned status ${response.status} for ${url}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `TMDB fetch attempt ${attempt} failed. Retrying in ${backoffMs}ms...`,
          error
        );
        await sleep(backoffMs);
      }
    }
  }

  throw new Error(`TMDB fetch failed after ${MAX_RETRIES} attempts: ${String(lastError)}`);
}

// --- Public Helpers ---

export function buildCoverImageUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

export function buildLogoUrl(logoPath: string | null): string | null {
  if (!logoPath) return null;
  return `${TMDB_LOGO_BASE}${logoPath}`;
}

// --- Public API ---

export async function fetchOnAirShows(): Promise<TMDBShowDetail[]> {
  // Step 1: Collect all show IDs from paginated on_the_air list
  const showIds: number[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    console.log(`Fetching TMDB on_the_air page ${currentPage}/${totalPages}...`);
    const pageData = await fetchWithRetry<TMDBOnAirResponse>(
      `${TMDB_BASE_URL}/tv/on_the_air?page=${currentPage}`
    );
    totalPages = pageData.total_pages;
    showIds.push(...pageData.results.map((s) => s.id));
    currentPage++;

    if (currentPage <= totalPages) {
      await sleep(PAGE_DELAY_MS);
    }
  } while (currentPage <= totalPages);

  console.log(`Found ${showIds.length} on-air shows. Fetching details...`);

  // Step 2: Fetch detail for each show to get next_episode_to_air
  const details: TMDBShowDetail[] = [];

  for (let i = 0; i < showIds.length; i++) {
    try {
      const detail = await fetchWithRetry<TMDBShowDetail>(
        `${TMDB_BASE_URL}/tv/${showIds[i]}`
      );
      details.push(detail);
    } catch (error) {
      console.error(`Failed to fetch details for TMDB show ID ${showIds[i]}:`, error);
    }

    if (i < showIds.length - 1) {
      await sleep(DETAIL_DELAY_MS);
    }
  }

  console.log(`TMDB fetch complete. Total shows with details: ${details.length}`);
  return details;
}
