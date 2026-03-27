import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subreddit, sort = "hot", limit = 25 } = await req.json();

    if (!subreddit) {
      return new Response(JSON.stringify({ error: "subreddit required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&t=day`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CommunityPulse/1.0 (server)" },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Reddit returned ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const posts = data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      author: child.data.author,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      permalink: child.data.permalink,
      url: child.data.url,
      selftext: child.data.selftext || "",
      link_flair_text: child.data.link_flair_text,
      thumbnail: child.data.thumbnail,
    }));

    return new Response(JSON.stringify(posts), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
