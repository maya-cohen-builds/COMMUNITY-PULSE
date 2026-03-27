export const SUBREDDITS = [
  "LocalLLaMA",
  "MachineLearning",
  "mlops",
  "artificial",
  "nvidia",
  "StableDiffusion",
] as const;

export type Subreddit = (typeof SUBREDDITS)[number];

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  selftext: string;
  link_flair_text: string | null;
  thumbnail: string;
}

export type SortMode = "hot" | "new" | "top";

export async function fetchSubredditPosts(
  subreddit: string,
  sort: SortMode = "hot",
  limit = 25
): Promise<RedditPost[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${supabaseUrl}/functions/v1/reddit-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
    },
    body: JSON.stringify({ subreddit, sort, limit }),
  });
  if (!res.ok) throw new Error(`Failed to fetch r/${subreddit}`);
  return res.json();
}

export async function fetchAllSubreddits(
  sort: SortMode = "hot",
  limit = 25
): Promise<RedditPost[]> {
  const results = await Promise.allSettled(
    SUBREDDITS.map((sub) => fetchSubredditPosts(sub, sort, limit))
  );
  const posts: RedditPost[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") posts.push(...r.value);
  });
  return posts;
}

// Simple keyword-based sentiment
const POSITIVE_WORDS = new Set([
  "amazing", "awesome", "great", "love", "best", "excellent", "incredible",
  "breakthrough", "impressive", "fantastic", "beautiful", "perfect", "fast",
  "powerful", "revolutionary", "exciting", "success", "improved", "upgrade",
  "open source", "free", "release", "launch", "milestone",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "worst", "terrible", "hate", "awful", "broken", "fail", "crash",
  "slow", "expensive", "disappointed", "scam", "buggy", "useless", "problem",
  "issue", "error", "warning", "concern", "controversy", "lawsuit", "ban",
  "censorship", "shutdown", "layoff",
]);

export type Sentiment = "positive" | "negative" | "neutral";

export function analyzeSentiment(title: string, flair: string | null): Sentiment {
  const text = `${title} ${flair || ""}`.toLowerCase();
  const words = text.split(/\W+/);
  let score = 0;
  words.forEach((w) => {
    if (POSITIVE_WORDS.has(w)) score++;
    if (NEGATIVE_WORDS.has(w)) score--;
  });
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

// Extract trending terms
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "don", "now", "and", "but", "or", "if", "while", "that", "this",
  "it", "its", "my", "your", "his", "her", "our", "their", "what",
  "which", "who", "whom", "these", "those", "i", "me", "we", "you",
  "he", "she", "they", "them", "us", "am", "about", "up", "any",
  "like", "get", "got", "using", "use", "new", "one", "also", "even",
  "much", "many", "way", "well", "back", "still", "going", "make",
  "made", "think", "know", "see", "look", "want", "give", "take",
  "come", "good", "first", "last", "long", "great", "little", "right",
  "old", "big", "high", "different", "small", "large", "next", "early",
  "young", "important", "public", "bad", "same", "able", "try",
  "really", "something", "reddit", "anyone", "someone", "question",
  "post", "help", "people", "been", "would", "could", "should", "does",
  "did", "doing", "done", "being", "having", "getting",
]);

export function extractTrendingTerms(
  posts: RedditPost[],
  topN = 20
): { term: string; count: number }[] {
  const freq: Record<string, number> = {};
  posts.forEach((p) => {
    const words = p.title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-\.]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const unique = new Set(words);
    unique.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function timeAgo(utcSeconds: number): string {
  const diff = Date.now() / 1000 - utcSeconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
