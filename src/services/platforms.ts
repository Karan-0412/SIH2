export interface PlatformData {
  solved: number;
  hours: number;
  courses: number;
  contests?: number;
  rating?: number;
}

// Env-configurable proxy base for platforms that require server-side fetching
const PLATFORM_API_BASE: string = (import.meta as any)?.env?.VITE_PLATFORM_API_BASE || '';

// Optional API keys (if your proxy expects them)
const API_KEY: string | undefined = (import.meta as any)?.env?.VITE_PLATFORM_API_KEY;
const GFG_KEY: string | undefined = (import.meta as any)?.env?.VITE_GFG_API_KEY;
const HACKERRANK_KEY: string | undefined = (import.meta as any)?.env?.VITE_HACKERRANK_API_KEY;
const HACKEREARTH_KEY: string | undefined = (import.meta as any)?.env?.VITE_HACKEREARTH_API_KEY;
const CODECHEF_KEY: string | undefined = (import.meta as any)?.env?.VITE_CODECHEF_API_KEY;

function buildHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  if (extra) Object.assign(headers, extra);
  return headers;
}

async function fetchFromProxy<T>(path: string, keyName?: 'gfg'|'hackerrank'|'hackerearth'|'codechef'): Promise<T> {
  if (!PLATFORM_API_BASE) {
    // No proxy configured
    throw new Error('Platform proxy base is not configured (VITE_PLATFORM_API_BASE).');
  }
  const keyHeader: Record<string, string> = {};
  if (keyName === 'gfg' && GFG_KEY) keyHeader['x-gfg-key'] = GFG_KEY;
  if (keyName === 'hackerrank' && HACKERRANK_KEY) keyHeader['x-hackerrank-key'] = HACKERRANK_KEY;
  if (keyName === 'hackerearth' && HACKEREARTH_KEY) keyHeader['x-hackerearth-key'] = HACKEREARTH_KEY;
  if (keyName === 'codechef' && CODECHEF_KEY) keyHeader['x-codechef-key'] = CODECHEF_KEY;

  const res = await fetch(`${PLATFORM_API_BASE}${path}`, {
    headers: buildHeaders(keyHeader),
    method: 'GET',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Proxy ${path} responded ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * ✅ LeetCode via stats API (no GraphQL, no CORS issues)
 * Example: https://leetcode-stats-api.herokuapp.com/leetcode
 */
export async function fetchLeetCodeData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${studentId}`);
    if (!res.ok) {
      console.error('LeetCode API responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    const json = await res.json();

    if (json.status === "error") {
      return { solved: 0, hours: 0, courses: 0 };
    }

    const solved = json.totalSolved || 0;
    const contests = json.totalContests || 0;
    const rating = json.contestRating || 0;
    return { 
      solved, 
      hours: Math.floor(solved / 10), 
      courses: 0,
      contests,
      rating
    };
  } catch (err) {
    console.error('Network error fetching LeetCode data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ Codeforces API (counts unique solved problems)
 * Example: https://codeforces.com/api/user.status?handle=tourist
 */
export async function fetchCodeforcesData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${studentId}`);
    if (!res.ok) {
      console.error('Codeforces API responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    const json = await res.json();

    if (json.status !== "OK") {
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }

    // count unique accepted problems
    const solved = new Set(
      json.result
        .filter((s: any) => s.verdict === "OK")
        .map((s: any) => s.problem.name)
    ).size;

    // Get user info for rating
    const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${studentId}`);
    let rating = 0;
    if (userRes.ok) {
      const userJson = await userRes.json();
      if (userJson.status === "OK" && userJson.result?.[0]) {
        rating = userJson.result[0].rating || 0;
      }
    }

    return { 
      solved, 
      hours: Math.floor(solved / 5), 
      courses: 0,
      contests: 0,
      rating
    };
  } catch (err) {
    console.error('Network error fetching Codeforces data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ Codewars API
 * Example: https://www.codewars.com/api/v1/users/someusername
 */
export async function fetchCodewarsData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`https://www.codewars.com/api/v1/users/${studentId}`);
    if (!res.ok) {
      console.error('Codewars API responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    const json = await res.json();

    if (json.success === false || json.name === undefined) {
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }

    const solved = json.codeChallenges?.totalCompleted || 0;
    const honor = json.honor || 0;
    return { 
      solved, 
      hours: Math.floor(solved / 8), 
      courses: 0,
      contests: 0,
      rating: Math.floor(honor / 100) // Convert honor to a rating-like number
    };
  } catch (err) {
    console.error('Network error fetching Codewars data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

// GFG / HackerRank / HackerEarth / CodeChef -> use proxy (Edge Function / API Gateway / server)
export async function fetchGFGData(studentId: string): Promise<PlatformData> {
  try {
    const data = await fetchFromProxy<PlatformData>(`/gfg/${encodeURIComponent(studentId)}`, 'gfg');
    return normalizePlatformData(data);
  } catch (err) {
    console.error('Error via proxy GFG for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

export async function fetchHackerRankData(studentId: string): Promise<PlatformData> {
  try {
    const data = await fetchFromProxy<PlatformData>(`/hackerrank/${encodeURIComponent(studentId)}`, 'hackerrank');
    return normalizePlatformData(data);
  } catch (err) {
    console.error('Error via proxy HackerRank for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

export async function fetchHackerEarthData(studentId: string): Promise<PlatformData> {
  try {
    const data = await fetchFromProxy<PlatformData>(`/hackerearth/${encodeURIComponent(studentId)}`, 'hackerearth');
    return normalizePlatformData(data);
  } catch (err) {
    console.error('Error via proxy HackerEarth for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

export async function fetchCodeChefData(studentId: string): Promise<PlatformData> {
  try {
    const data = await fetchFromProxy<PlatformData>(`/codechef/${encodeURIComponent(studentId)}`, 'codechef');
    return normalizePlatformData(data);
  } catch (err) {
    console.error('Error via proxy CodeChef for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

function normalizePlatformData(d: any): PlatformData {
  return {
    solved: Number(d?.solved) || 0,
    hours: Number(d?.hours) || 0,
    courses: Number(d?.courses) || 0,
    contests: Number(d?.contests) || 0,
    rating: Number(d?.rating) || 0,
  };
}

// placeholder
export async function fetchPlaceholderData(): Promise<PlatformData> {
  return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
}
