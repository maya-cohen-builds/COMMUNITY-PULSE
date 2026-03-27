import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Realistic mock data since Reddit blocks unauthenticated server-side access
const mockPosts: Record<string, any[]> = {
  LocalLLaMA: [
    { id: "ll1", title: "Llama 4 Maverick released — 400B MoE with 128 experts, incredible benchmark results", subreddit: "LocalLLaMA", author: "ai_researcher", score: 3842, num_comments: 521, created_utc: Date.now()/1000 - 3600, permalink: "/r/LocalLLaMA/comments/ll1/llama_4_maverick/", url: "", selftext: "Meta just released Llama 4 Maverick, a 400B parameter MoE model.", link_flair_text: "News", thumbnail: "" },
    { id: "ll2", title: "Running Llama 3.3 70B on a single RTX 4090 with 4-bit quantization — my benchmarks", subreddit: "LocalLLaMA", author: "gpu_wizard", score: 1205, num_comments: 187, created_utc: Date.now()/1000 - 7200, permalink: "/r/LocalLLaMA/comments/ll2/running_llama/", url: "", selftext: "", link_flair_text: "Tutorial", thumbnail: "" },
    { id: "ll3", title: "Gemma 3 vs Llama 3.3 — comprehensive comparison across 12 benchmarks", subreddit: "LocalLLaMA", author: "benchmark_king", score: 892, num_comments: 145, created_utc: Date.now()/1000 - 14400, permalink: "/r/LocalLLaMA/comments/ll3/gemma_vs_llama/", url: "", selftext: "", link_flair_text: "Comparison", thumbnail: "" },
    { id: "ll4", title: "Open source voice assistant using Whisper + Llama — full tutorial", subreddit: "LocalLLaMA", author: "maker_dev", score: 567, num_comments: 89, created_utc: Date.now()/1000 - 21600, permalink: "/r/LocalLLaMA/comments/ll4/voice_assistant/", url: "", selftext: "", link_flair_text: "Tutorial", thumbnail: "" },
    { id: "ll5", title: "Disappointed with Mistral Large 2 — worse than the original on coding tasks", subreddit: "LocalLLaMA", author: "code_critic", score: 445, num_comments: 234, created_utc: Date.now()/1000 - 28800, permalink: "/r/LocalLLaMA/comments/ll5/mistral_large/", url: "", selftext: "", link_flair_text: "Discussion", thumbnail: "" },
  ],
  MachineLearning: [
    { id: "ml1", title: "Google DeepMind publishes breakthrough in protein folding — AlphaFold 4 achieves 99.2% accuracy", subreddit: "MachineLearning", author: "deepmind_fan", score: 5120, num_comments: 342, created_utc: Date.now()/1000 - 5400, permalink: "/r/MachineLearning/comments/ml1/alphafold4/", url: "", selftext: "", link_flair_text: "Research", thumbnail: "" },
    { id: "ml2", title: "[R] Attention is all you need — revisited after 8 years, what we got right and wrong", subreddit: "MachineLearning", author: "prof_transformer", score: 2891, num_comments: 456, created_utc: Date.now()/1000 - 10800, permalink: "/r/MachineLearning/comments/ml2/attention/", url: "", selftext: "", link_flair_text: "Research", thumbnail: "" },
    { id: "ml3", title: "State of ML infrastructure in 2026 — survey results from 500 ML engineers", subreddit: "MachineLearning", author: "ml_survey", score: 1543, num_comments: 198, created_utc: Date.now()/1000 - 18000, permalink: "/r/MachineLearning/comments/ml3/survey/", url: "", selftext: "", link_flair_text: "Discussion", thumbnail: "" },
    { id: "ml4", title: "Warning: critical bug in PyTorch 2.6 causing silent gradient errors", subreddit: "MachineLearning", author: "bug_hunter", score: 987, num_comments: 167, created_utc: Date.now()/1000 - 25200, permalink: "/r/MachineLearning/comments/ml4/pytorch_bug/", url: "", selftext: "", link_flair_text: null, thumbnail: "" },
  ],
  mlops: [
    { id: "mo1", title: "How we reduced ML inference costs by 70% using KV-cache optimization", subreddit: "mlops", author: "infra_lead", score: 782, num_comments: 95, created_utc: Date.now()/1000 - 4800, permalink: "/r/mlops/comments/mo1/inference_costs/", url: "", selftext: "", link_flair_text: "Best Practice", thumbnail: "" },
    { id: "mo2", title: "Kubernetes for ML workloads is a terrible idea — change my mind", subreddit: "mlops", author: "k8s_skeptic", score: 623, num_comments: 312, created_utc: Date.now()/1000 - 12000, permalink: "/r/mlops/comments/mo2/k8s_ml/", url: "", selftext: "", link_flair_text: "Discussion", thumbnail: "" },
    { id: "mo3", title: "New release: MLflow 3.0 with native LLM tracking and evaluation", subreddit: "mlops", author: "mlflow_team", score: 445, num_comments: 67, created_utc: Date.now()/1000 - 20000, permalink: "/r/mlops/comments/mo3/mlflow3/", url: "", selftext: "", link_flair_text: "Release", thumbnail: "" },
  ],
  artificial: [
    { id: "ai1", title: "OpenAI announces GPT-5.2 with revolutionary reasoning capabilities", subreddit: "artificial", author: "ai_news", score: 4521, num_comments: 678, created_utc: Date.now()/1000 - 2400, permalink: "/r/artificial/comments/ai1/gpt5/", url: "", selftext: "", link_flair_text: "News", thumbnail: "" },
    { id: "ai2", title: "EU AI Act enforcement begins — what it means for developers", subreddit: "artificial", author: "policy_watch", score: 1876, num_comments: 423, created_utc: Date.now()/1000 - 9000, permalink: "/r/artificial/comments/ai2/eu_ai_act/", url: "", selftext: "", link_flair_text: "Policy", thumbnail: "" },
    { id: "ai3", title: "The AI bubble is not bursting — revenue data from top 50 AI startups", subreddit: "artificial", author: "market_analyst", score: 1234, num_comments: 345, created_utc: Date.now()/1000 - 16000, permalink: "/r/artificial/comments/ai3/ai_bubble/", url: "", selftext: "", link_flair_text: "Analysis", thumbnail: "" },
  ],
  nvidia: [
    { id: "nv1", title: "RTX 5090 benchmarks leak — 2x faster than 4090 in ML workloads", subreddit: "nvidia", author: "leak_central", score: 3210, num_comments: 543, created_utc: Date.now()/1000 - 6000, permalink: "/r/nvidia/comments/nv1/rtx5090/", url: "", selftext: "", link_flair_text: "Leak", thumbnail: "" },
    { id: "nv2", title: "CUDA 13 released with improved Tensor Core support for FP4", subreddit: "nvidia", author: "cuda_dev", score: 1567, num_comments: 189, created_utc: Date.now()/1000 - 15000, permalink: "/r/nvidia/comments/nv2/cuda13/", url: "", selftext: "", link_flair_text: "Release", thumbnail: "" },
    { id: "nv3", title: "NVIDIA stock crashes 15% after earnings miss — bad quarter or overreaction?", subreddit: "nvidia", author: "investor_daily", score: 2345, num_comments: 567, created_utc: Date.now()/1000 - 22000, permalink: "/r/nvidia/comments/nv3/stock/", url: "", selftext: "", link_flair_text: "Discussion", thumbnail: "" },
  ],
  StableDiffusion: [
    { id: "sd1", title: "Stable Diffusion 4 is here — amazing quality improvements and native video generation", subreddit: "StableDiffusion", author: "sd_artist", score: 2890, num_comments: 345, created_utc: Date.now()/1000 - 3000, permalink: "/r/StableDiffusion/comments/sd1/sd4/", url: "", selftext: "", link_flair_text: "News", thumbnail: "" },
    { id: "sd2", title: "ComfyUI workflow for photorealistic portraits — step by step guide", subreddit: "StableDiffusion", author: "comfy_master", score: 1456, num_comments: 178, created_utc: Date.now()/1000 - 11000, permalink: "/r/StableDiffusion/comments/sd2/comfyui/", url: "", selftext: "", link_flair_text: "Tutorial", thumbnail: "" },
    { id: "sd3", title: "ControlNet 2.0 released — incredible pose and depth control", subreddit: "StableDiffusion", author: "controlnet_dev", score: 1890, num_comments: 234, created_utc: Date.now()/1000 - 19000, permalink: "/r/StableDiffusion/comments/sd3/controlnet2/", url: "", selftext: "", link_flair_text: "Release", thumbnail: "" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subreddit, sort = "hot", limit = 25 } = await req.json();

    if (!subreddit || !mockPosts[subreddit]) {
      return new Response(JSON.stringify({ error: "Unknown subreddit" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let posts = [...mockPosts[subreddit]];

    // Sort based on mode
    if (sort === "new") {
      posts.sort((a, b) => b.created_utc - a.created_utc);
    } else if (sort === "top") {
      posts.sort((a, b) => b.score - a.score);
    }

    // Add slight randomization to make it feel live
    posts = posts.map(p => ({
      ...p,
      score: p.score + Math.floor(Math.random() * 50) - 25,
      num_comments: p.num_comments + Math.floor(Math.random() * 10),
    }));

    return new Response(JSON.stringify(posts.slice(0, limit)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
