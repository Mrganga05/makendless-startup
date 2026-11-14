export default function PrismFallback({ mode }: { mode: number }) {
  const colors = ["#22d3ee", "#8b5cf6", "#c7a6ff"];
  const ends = [-70, 0, 70];
  return (
    <svg viewBox="0 0 600 400" className="h-full w-full" role="img" aria-label="A beam of light splitting through a glass prism into three colored beams">
      <line x1="30" y1="200" x2="240" y2="200" stroke="#f6f8ff" strokeWidth="4" strokeLinecap="round" />
      <polygon points="240,100 360,300 140,300" fill="rgba(205,214,255,.18)" stroke="#eaf2ff" strokeWidth="2" transform="rotate(90 250 200)" />
      {colors.map((c, i) => (
        <line key={c} x1="320" y1="200" x2="580" y2={200 + ends[i]} stroke={c} strokeWidth="8" strokeLinecap="round" opacity={i === mode ? 1 : 0.22} style={{ transition: "opacity .4s" }} />
      ))}
    </svg>
  );
}
