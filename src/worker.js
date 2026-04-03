const ALLOWED_ORIGIN = "https://theoutsidelaine.com";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET: return count for a slug without incrementing (for list pages)
    if (request.method === "GET") {
      const slug = new URL(request.url).searchParams.get("slug");
      if (!slug || typeof slug !== "string") {
        return new Response("Missing or invalid slug", { status: 400 });
      }
      const current = await env.PAGE_VIEWS.get(slug);
      const count = parseInt(current || "0");
      return new Response(JSON.stringify({ count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: increment count and return new value (for article pages)
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { slug } = body;
    if (!slug || typeof slug !== "string") {
      return new Response("Missing or invalid slug", { status: 400 });
    }

    const current = await env.PAGE_VIEWS.get(slug);   //取的目前 page 的瀏覽數
    const newCount = parseInt(current || "0") + 1;    //+1
    await env.PAGE_VIEWS.put(slug, String(newCount)); //更新 KV 中該 slug 的瀏覽數

    return new Response(JSON.stringify({ count: newCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
