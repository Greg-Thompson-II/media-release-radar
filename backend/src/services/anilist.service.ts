import "dotenv/config";

// --- Types ---

export interface AniListNextAiringEpisode {
  episode: number;
  airingAt: number; // Unix timestamp in seconds
}

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
  };
  coverImage: {
    large: string | null;
  };
  status: string;
  nextAiringEpisode: AniListNextAiringEpisode | null;
}

interface AniListPageInfo {
  hasNextPage: boolean;
  currentPage: number;
}

interface AniListPage {
  pageInfo: AniListPageInfo;
  media: AniListMedia[];
}

interface AniListResponseData {
  Page: AniListPage;
}

interface AniListResponse {
  data: AniListResponseData;
}

// --- Constants ---

const ANILIST_URL = "https://graphql.anilist.co";
const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const PER_PAGE = 50;
// Delay between paginated requests to respect the 90 req/min rate limit (~667ms min)
const PAGE_DELAY_MS = 700;

const RELEASING_MEDIA_QUERY = `
  query ($page: Int) {
    Page(page: $page, perPage: ${PER_PAGE}) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(status: RELEASING, type: ANIME) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        status
        nextAiringEpisode {
          episode
          airingAt
        }
      }
    }
  }
`;

// --- Helpers ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page: number): Promise<AniListPage> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: RELEASING_MEDIA_QUERY, variables: { page } }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60_000;
        console.warn(`AniList rate limit hit. Waiting ${waitMs}ms before retry.`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`AniList API returned status ${response.status}`);
      }

      const json = (await response.json()) as AniListResponse;
      return json.data.Page;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(`AniList fetch attempt ${attempt} failed. Retrying in ${backoffMs}ms...`, error);
        await sleep(backoffMs);
      }
    }
  }

  throw new Error(`AniList fetch failed after ${MAX_RETRIES} attempts: ${String(lastError)}`);
}

// --- Public API ---

export async function fetchReleasingMedia(): Promise<AniListMedia[]> {
  const allMedia: AniListMedia[] = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(`Fetching AniList page ${currentPage}...`);
    const pageData = await fetchPage(currentPage);

    allMedia.push(...pageData.media);
    hasNextPage = pageData.pageInfo.hasNextPage;
    currentPage++;

    if (hasNextPage) {
      await sleep(PAGE_DELAY_MS);
    }
  }

  console.log(`AniList fetch complete. Total titles fetched: ${allMedia.length}`);
  return allMedia;
}
