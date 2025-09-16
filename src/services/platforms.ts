export interface PlatformData {
  solved: number;
  hours: number;
  courses: number;
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
    return { solved, hours: Math.floor(solved / 10), courses: 0 };
  } catch (err) {
    console.error('Network error fetching LeetCode data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
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
      return { solved: 0, hours: 0, courses: 0 };
    }

    // count unique accepted problems
    const solved = new Set(
      json.result
        .filter((s: any) => s.verdict === "OK")
        .map((s: any) => s.problem.name)
    ).size;

    return { solved, hours: Math.floor(solved / 5), courses: 0 };
  } catch (err) {
    console.error('Network error fetching Codeforces data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
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
      return { solved: 0, hours: 0, courses: 0 };
    }

    const solved = json.codeChallenges?.totalCompleted || 0;
    return { solved, hours: Math.floor(solved / 8), courses: 0 };
  } catch (err) {
    console.error('Network error fetching Codewars data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
  }
}

/**
 * Placeholder if no platform selected
 */
// 🚨 For GFG / HackerRank / HackerEarth / CodeChef -> proxy through backend
export async function fetchGFGData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`http://localhost:4000/api/gfg/${studentId}`);
    if (!res.ok) {
      console.error('GFG proxy responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    return res.json();
  } catch (err) {
    console.error('Network error fetching GFG data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
  }
}

export async function fetchHackerRankData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`http://localhost:4000/api/hackerrank/${studentId}`);
    if (!res.ok) {
      console.error('HackerRank proxy responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    return res.json();
  } catch (err) {
    console.error('Network error fetching HackerRank data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
  }
}

export async function fetchHackerEarthData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`http://localhost:4000/api/hackerearth/${studentId}`);
    if (!res.ok) {
      console.error('HackerEarth proxy responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    return res.json();
  } catch (err) {
    console.error('Network error fetching HackerEarth data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
  }
}

export async function fetchCodeChefData(studentId: string): Promise<PlatformData> {
  try {
    const res = await fetch(`http://localhost:4000/api/codechef/${studentId}`);
    if (!res.ok) {
      console.error('CodeChef proxy responded with', res.status);
      return { solved: 0, hours: 0, courses: 0 };
    }
    return res.json();
  } catch (err) {
    console.error('Network error fetching CodeChef data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0 };
  }
}

// placeholder
export async function fetchPlaceholderData(): Promise<PlatformData> {
  return { solved: 0, hours: 0, courses: 0 };
}
