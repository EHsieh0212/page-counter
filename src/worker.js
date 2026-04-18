const ALLOWED_ORIGIN = "https://theoutsidelaine.com";
const VALID_SLUG = /^\/p\/[a-z0-9-]+\/$/;

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

    // GET: return count(s) for slug(s) without incrementing (for list/article pages)
    if (request.method === "GET") {
      const params = new URL(request.url).searchParams;

      // Batch mode: ?slugs=slug1,slug2,...
      const slugsParam = params.get("slugs");
      if (slugsParam) {
        const slugs = slugsParam.split(",");
        if (slugs.length === 0 || slugs.some((s) => !VALID_SLUG.test(s))) {
          return new Response("Missing or invalid slugs", { status: 400 });
        }
        const counts = await Promise.all(
          slugs.map(async (s) => {
            const val = await env.PAGE_VIEWS.get(s);
            return [s, parseInt(val || "0")];
          })
        );
        return new Response(JSON.stringify(Object.fromEntries(counts)), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Single mode: ?slug=slug1
      const slug = params.get("slug");
      if (!slug || typeof slug !== "string" || !VALID_SLUG.test(slug)) {
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
    if (!slug || typeof slug !== "string" || !VALID_SLUG.test(slug)) {
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
