interface TVMazeNextEpisode {
  airstamp: string | null;
}

interface TVMazeShowResponse {
  _embedded?: {
    nextepisode?: TVMazeNextEpisode;
  };
}

export async function getExactAirTime(
  showName: string,
): Promise<string | null> {
  const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(showName)}&embed=nextepisode`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MediaReleaseRadar/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        `[TVMaze] Failed for "${showName}" - Status: ${response.status}`,
      );
      return null;
    }

    const data = (await response.json()) as TVMazeShowResponse;
    const airstamp = data._embedded?.nextepisode?.airstamp ?? null;

    if (!airstamp) {
      console.log(`[TVMaze] No airstamp found for "${showName}"`);
      return null;
    }

    // TVMaze uses T12:00:00Z as a placeholder when the exact air time is unknown.
    // Treat it as no exact time so Calendar shows date-only instead of "7:00 AM CDT".
    const date = new Date(airstamp);
    if (date.getUTCHours() === 12 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0) {
      console.log(`[TVMaze] Noon UTC placeholder detected for "${showName}", treating as date-only`);
      return null;
    }

    console.log(`[TVMaze] Success: "${showName}" -> ${airstamp}`);
    return airstamp;
  } catch (error) {
    console.error(`[TVMaze] Fetch error for "${showName}":`, error);
    return null;
  }
}
