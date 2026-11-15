// Fixed review choices: each star rating offers exactly six words.
// The database enforces the same list (reviews_word_matches_stars), so change both together.
export const REVIEW_WORDS: Record<1 | 2 | 3 | 4 | 5, readonly string[]> = {
  1: ["Demorado", "Confuso", "Desatento", "Complicado", "Insatisfeito", "Decepcionante"],
  2: ["Lento", "Regular", "Incompleto", "Pouca ajuda", "Esperava mais", "Desorganizado"],
  3: ["Ok", "Razoável", "Mediano", "Pode melhorar", "Aceitável", "Cumpriu o básico"],
  4: ["Bom", "Atencioso", "Claro", "Rápido", "Prestativo", "Confiável"],
  5: ["Excelente", "Nota 10", "Recomendo", "Super atenciosa", "Muito rápida", "Paciente"],
};

export const STAR_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente",
};

export type Stars = 1 | 2 | 3 | 4 | 5;

export function isStars(n: number): n is Stars {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

export function isValidWord(stars: number, word: string): boolean {
  return isStars(stars) && REVIEW_WORDS[stars].includes(word);
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}
