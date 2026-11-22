/* Small text helpers for Privacy, Terms, FAQ and About. "**bold**" inside a string renders bold. */

function Bold({ text, strong }: { text: string; strong: string }) {
  return <>{text.split("**").map((s, i) => (i % 2 ? <strong key={i} className={strong}>{s}</strong> : s))}</>;
}
/** "**bold**" and "[link text](https://…)" inside a string. */
export function Rich({ text, strong = "font-bold text-dark" }: { text: string; strong?: string }) {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/);
  return <>{parts.map((p, i) => i % 3 === 1 ? <a key={i} href={parts[i + 1]} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">{p}</a> : i % 3 === 2 ? null : <Bold key={i} text={p} strong={strong} />)}</>;
}

export function Bullets({ items, strong, className = "" }: { items: string[]; strong?: string; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
          <span><Rich text={t} strong={strong} /></span>
        </li>
      ))}
    </ul>
  );
}

/** A block is a paragraph (string), a bullet list (string[]) or a sub-heading ({ h }). */
export type Block = string | string[] | { h: string };
export type LegalSection = { id: string; title: string; body: Block[] };

export function Blocks({ body, strong }: { body: Block[]; strong?: string }) {
  return (
    <>
      {body.map((b, i) =>
        typeof b === "string" ? <p key={i}><Rich text={b} strong={strong} /></p>
        : Array.isArray(b) ? <Bullets key={i} items={b} strong={strong} />
        : <h3 key={i} className="pt-2 text-lg font-bold text-dark">{b.h}</h3>
      )}
    </>
  );
}

export function LegalSections({ lead, sections }: { lead?: string; sections: LegalSection[] }) {
  return (
    <div className="min-w-0 space-y-12 text-[17px] leading-relaxed text-muted-dark">
      {lead && <p>{lead}</p>}
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-28">
          <h2 className="text-2xl font-extrabold text-dark">{s.title}</h2>
          <div className="mt-4 space-y-4"><Blocks body={s.body} /></div>
        </section>
      ))}
    </div>
  );
}
