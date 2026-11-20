"use client";
/* Floating "Chat on WhatsApp" button (every page except /admin) and the footer social icons.
   Number, message and links come from data/owner.ts via data/settings.ts. */
import { usePathname } from "next/navigation";
import { SETTINGS, whatsappTo } from "../data/settings";

const WA = "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z";
const ICONS: Record<string, { label: string; d: string }> = {
  instagram: { label: "Instagram", d: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1A7.3 7.3 0 0 0 5.5 2.6 5 5 0 0 0 2.6 5.5a7.3 7.3 0 0 0-.5 2.4C2 9 2 9.3 2 12s0 3 .1 4.1c0 .8.2 1.6.5 2.4a5 5 0 0 0 2.9 2.9c.8.3 1.6.4 2.4.5H12c2.7 0 3 0 4.1-.1.8 0 1.6-.2 2.4-.5a5 5 0 0 0 2.9-2.9c.3-.8.4-1.6.5-2.4V12c0-2.7 0-3-.1-4.1a7.3 7.3 0 0 0-.5-2.4 5 5 0 0 0-2.9-2.9 7.3 7.3 0 0 0-2.4-.5C15 2 14.7 2 12 2Zm0 1.8h4c.6 0 1.2.1 1.8.3a3.2 3.2 0 0 1 1.8 1.8c.2.6.3 1.2.3 1.8v8.6c0 .6-.1 1.2-.3 1.8a3.2 3.2 0 0 1-1.8 1.8c-.6.2-1.2.3-1.8.3H8c-.6 0-1.2-.1-1.8-.3a3.2 3.2 0 0 1-1.8-1.8c-.2-.6-.3-1.2-.3-1.8V7.7c0-.6.1-1.2.3-1.8a3.2 3.2 0 0 1 1.8-1.8c.6-.2 1.2-.3 1.8-.3h4Z" },
  youtube: { label: "YouTube", d: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" },
  facebook: { label: "Facebook", d: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8Z" },
  linkedin: { label: "LinkedIn", d: "M4.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h3v12H3V9Zm6 0h3v1.7A3.6 3.6 0 0 1 15.2 9C18.3 9 19 11 19 13.7V21h-3v-6.5c0-1.6-.1-3-1.9-3-1.9 0-2.1 1.4-2.1 2.9V21H9V9Z" },
  x: { label: "X", d: "M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7-8.1L2.3 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5Z" },
};

export function Socials({ className = "" }: { className?: string }) {
  const list = Object.entries(SETTINGS.socials).filter(([, url]) => url);
  if (!list.length) return null;
  return (
    <ul className={`flex gap-2 ${className}`} aria-label="MAKENDLESS on social media">
      {list.map(([k, url]) => (
        <li key={k}>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={ICONS[k]?.label ?? k} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-colors hover:border-white hover:bg-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d={ICONS[k]?.d ?? ""} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function WhatsAppFloat() {
  const path = usePathname();
  const href = whatsappTo(SETTINGS.whatsappMessage);
  if (!href || path?.startsWith("/admin")) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA} /></svg>
      <span className="wa-float-label">Chat on WhatsApp</span>
    </a>
  );
}
