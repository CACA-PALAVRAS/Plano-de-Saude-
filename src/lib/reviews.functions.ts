import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cleanName, isValidWord } from "./review-words";
import { createPublicSupabase } from "./reviews.server";

const reviewSchema = z
  .object({
    name: z.string().transform(cleanName).pipe(z.string().min(2, "Digite seu nome").max(60, "Nome muito longo")),
    stars: z.number().int().min(1).max(5),
    word: z.string().max(40),
  })
  .refine((r) => isValidWord(r.stars, r.word), { message: "Escolha uma das palavras", path: ["word"] });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicSupabase();
    const { error } = await supabase.from("reviews").insert({ name: data.name, stars: data.stars, word: data.word });
    if (error) {
      console.error("review insert failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
