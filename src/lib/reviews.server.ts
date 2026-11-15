import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Publishable-key client for public review reads/inserts (RLS applies). Call only inside handlers.
export function createPublicSupabase() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    throw new Error(
      "Review storage requires VITE_SUPABASE_URL/SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY/SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type PublicReview = { name: string; stars: number; word: string };

export function renderReviewsHtml(reviews: PublicReview[], total: number, average: number | null): string {
  if (reviews.length === 0) {
    return '<div class="feat"><div class="rv"><p>Em breve, avaliações de clientes reais.</p></div></div>';
  }
  const avg = average === null ? "" : average.toFixed(1).replace(".", ",");
  const summary = `<p class="revsum rv"><span class="revstars" aria-hidden="true">★</span> <strong>${avg}</strong> de 5 · ${total} ${total === 1 ? "avaliação" : "avaliações"}</p>`;
  const cards = reviews
    .map((r) => {
      const stars = "★".repeat(r.stars) + '<span class="off">' + "★".repeat(5 - r.stars) + "</span>";
      return `<div class="rev rv"><div class="revstars" aria-label="${r.stars} de 5 estrelas">${stars}</div><p class="revword">“${esc(r.word)}”</p><p class="revname">${esc(r.name)}</p></div>`;
    })
    .join("");
  return summary + `<div class="revs">${cards}</div>`;
}
