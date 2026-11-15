import { describe, expect, it } from "vitest";
import { REVIEW_WORDS, isValidWord } from "@/lib/review-words";

describe("review choices", () => {
  it("offers exactly six words for each star rating from 1 to 5", () => {
    for (const n of [1, 2, 3, 4, 5] as const) expect(REVIEW_WORDS[n]).toHaveLength(6);
  });

  it("accepts a word only with the star rating it belongs to", () => {
    expect(isValidWord(5, "Excelente")).toBe(true);
    expect(isValidWord(1, "Excelente")).toBe(false);
    expect(isValidWord(6, "Excelente")).toBe(false);
  });
});
