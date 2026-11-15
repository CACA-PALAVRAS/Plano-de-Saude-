import { createFileRoute } from "@tanstack/react-router";
import siteHtml from "../site/corretora.html?raw";
import { createPublicSupabase, renderReviewsHtml } from "@/lib/reviews.server";

const MARKER = "<!--REVIEWS-->";

// The home page is the broker's hand-written HTML site, served as uploaded,
// with the latest client reviews filled in at the REVIEWS marker.
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: async () => {
        let reviewsHtml = renderReviewsHtml([], 0, null);
        try {
          const supabase = createPublicSupabase();
          const [{ data: latest }, { data: all }] = await Promise.all([
            supabase.from("reviews").select("name, stars, word").order("created_at", { ascending: false }).limit(9),
            supabase.from("reviews").select("stars").limit(1000),
          ]);
          const stars = (all ?? []).map((r) => r.stars);
          const avg = stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : null;
          reviewsHtml = renderReviewsHtml(latest ?? [], stars.length, avg);
        } catch (e) {
          console.error("reviews load failed", e);
        }
        return new Response(siteHtml.replace(MARKER, reviewsHtml), {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
