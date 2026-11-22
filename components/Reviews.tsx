/* Homepage client reviews: edited in /admin → Website content. Hidden until at least one review exists. */
import { REVIEWS } from "../data/work";
import { Eyebrow, KineticHeading } from "./ui";

export default function Reviews() {
  if (!REVIEWS.length) return null;
  return (
    <section id="reviews" data-tone="light" aria-labelledby="reviews-title" className="bg-paper px-4 py-16 text-dark sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Eyebrow tone="light">Reviews</Eyebrow>
        <KineticHeading id="reviews-title" text="What clients say" className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold leading-tight tracking-tight" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <li key={i} className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line">
              <p className="text-[17px] leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 font-extrabold">{r.name}{r.role && <span className="font-semibold text-muted-dark"> · {r.role}</span>}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
