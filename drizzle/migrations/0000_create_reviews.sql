CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 60),
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  word text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_word_matches_stars CHECK (
    (stars = 1 AND word IN ('Demorado','Confuso','Desatento','Complicado','Insatisfeito','Decepcionante')) OR
    (stars = 2 AND word IN ('Lento','Regular','Incompleto','Pouca ajuda','Esperava mais','Desorganizado')) OR
    (stars = 3 AND word IN ('Ok','Razoável','Mediano','Pode melhorar','Aceitável','Cumpriu o básico')) OR
    (stars = 4 AND word IN ('Bom','Atencioso','Claro','Rápido','Prestativo','Confiável')) OR
    (stars = 5 AND word IN ('Excelente','Nota 10','Recomendo','Super atenciosa','Muito rápida','Paciente'))
  )
);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT (name, stars, word) ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX reviews_created_at_idx ON public.reviews (created_at DESC);