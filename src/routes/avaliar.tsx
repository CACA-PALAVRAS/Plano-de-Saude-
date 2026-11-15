import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { REVIEW_WORDS, STAR_LABELS, cleanName, type Stars } from "@/lib/review-words";
import { submitReview } from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/avaliar")({
  head: () => ({
    meta: [
      { title: "Avalie seu atendimento | Talita Mota, corretora de saúde" },
      { name: "description", content: "Conte em poucos toques como foi seu atendimento com a corretora Talita Mota." },
      { property: "og:title", content: "Como foi seu atendimento com a Talita?" },
      { property: "og:description", content: "Deixe sua avaliação em poucos segundos: escolha as estrelas e uma palavra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=DM+Sans:wght@400;500;700&display=swap",
      },
    ],
  }),
  component: ReviewPage,
});

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
      <path
        d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z"
        className={cn("transition-colors duration-300", filled ? "fill-star stroke-star" : "fill-transparent stroke-muted-foreground/50")}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewPage() {
  const send = useServerFn(submitReview);
  const [name, setName] = useState("");
  const [stars, setStars] = useState<Stars | null>(null);
  const [hover, setHover] = useState<Stars | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [touched, setTouched] = useState(false);

  const nameOk = cleanName(name).length >= 2;
  const ready = nameOk && stars !== null && word !== null;
  const shown = hover ?? stars;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ready || status === "sending") return;
    setStatus("sending");
    try {
      const res = await send({ data: { name: cleanName(name), stars, word } });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <div className="max-w-md text-center animate-rise">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground animate-star-pop">
            ✓
          </div>
          <h1 className="font-serif text-4xl font-black leading-tight text-secondary">
            Obrigada, {cleanName(name).split(" ")[0]}!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Sua avaliação já aparece no site e me ajuda muito.</p>
          <a
            href="/#depo"
            className="mt-8 inline-flex rounded-full bg-primary px-7 py-4 font-bold text-primary-foreground transition-transform hover:-translate-y-1"
          >
            Ver no site
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 pb-16 pt-8">
      <div className="mx-auto max-w-lg">
        <a href="/" className="font-serif text-lg font-black text-secondary no-underline">
          Corretora de Saúde
        </a>

        <h1 className="mt-10 font-serif text-5xl font-black leading-[0.95] tracking-tight text-secondary animate-rise">
          Como foi seu <span className="text-primary">atendimento?</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground animate-rise [animation-delay:120ms]">
          Leva menos de um minuto. Obrigada por me ajudar!
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-10" noValidate>
          <section className="animate-rise [animation-delay:200ms]">
            <label htmlFor="nome" className="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground">
              1. Seu nome
            </label>
            <input
              id="nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              placeholder="Ex.: Maria Souza"
              className="w-full rounded-2xl border-2 border-input bg-card px-5 py-4 text-lg text-foreground outline-none transition-colors focus:border-primary"
            />
            {touched && !nameOk && <p className="mt-2 text-sm font-medium text-destructive">Digite seu nome.</p>}
          </section>

          <section className="animate-rise [animation-delay:280ms]">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">2. Sua nota</p>
            <div role="radiogroup" aria-label="Nota de 1 a 5 estrelas" className="flex gap-2" onMouseLeave={() => setHover(null)}>
              {([1, 2, 3, 4, 5] as Stars[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}: ${STAR_LABELS[n]}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => {
                    if (stars !== n) setWord(null);
                    setStars(n);
                  }}
                  className={cn(
                    "h-14 w-14 rounded-xl p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring",
                    stars !== null && n <= stars && "animate-star-pop",
                  )}
                  style={{ animationDelay: `${(n - 1) * 60}ms` }}
                >
                  <StarIcon filled={shown !== null && n <= shown} />
                </button>
              ))}
            </div>
            <p className="mt-3 h-7 font-serif text-2xl font-black text-primary" aria-live="polite">
              {shown ? STAR_LABELS[shown] : ""}
            </p>
            {touched && stars === null && <p className="text-sm font-medium text-destructive">Toque nas estrelas para dar sua nota.</p>}
          </section>

          {stars !== null && (
            <section key={stars} className="animate-rise">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                3. Uma palavra que resume
              </p>
              <div role="radiogroup" aria-label="Palavra que resume o atendimento" className="flex flex-wrap gap-2.5">
                {REVIEW_WORDS[stars].map((w, i) => (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={word === w}
                    onClick={() => setWord(w)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={cn(
                      "animate-rise rounded-full border-2 px-5 py-3 font-bold transition-all",
                      word === w
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg"
                        : "border-input bg-card text-foreground hover:-translate-y-0.5 hover:border-primary",
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
              {touched && word === null && <p className="mt-2 text-sm font-medium text-destructive">Escolha uma palavra.</p>}
            </section>
          )}

          {status === "error" && (
            <p className="rounded-2xl bg-destructive/10 p-4 font-medium text-destructive">
              Não consegui enviar agora. Confira sua internet e tente de novo.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className={cn(
              "w-full rounded-full bg-primary px-7 py-5 text-lg font-bold text-primary-foreground shadow-lg transition-all",
              ready ? "hover:-translate-y-1" : "opacity-60",
            )}
          >
            {status === "sending" ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      </div>
    </main>
  );
}
