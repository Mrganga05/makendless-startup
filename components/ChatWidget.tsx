"use client";
/* MAKENDLESS Assistant: floating chat button (stacked above the WhatsApp button) and chat panel.
   Talks to /api/chat (the Anthropic key stays on the server). Any element can open it with
   window.dispatchEvent(new CustomEvent("mk:open-chat")) — see openChat() below. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { SETTINGS, whatsappTo } from "../data/settings";
import { trackPixel } from "./MetaPixel";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
const KEY = "mk-chat-v1";
const MAX = 1000;
const GREETING = "Hi! I'm the MAKENDLESS Assistant. Ask me about our video editing, websites, AI assistants, prices or how a project works.";
const QUICK: [string, string][] = [
  ["Services", "What services do you offer?"],
  ["Pricing", "What are your prices?"],
  ["See our work", "Can I see your work?"],
  ["Contact", "How can I contact the team?"],
];

export function openChat() {
  window.dispatchEvent(new CustomEvent("mk:open-chat"));
}

/* Turns links and site paths in a reply into real links; drops markdown stars. */
const LINK = /(https?:\/\/[^\s)]+[^\s).,!?]|(?<![\w/])\/(?:create|build|studios|start-project|contact|faq|privacy|terms|grow)(?:#[\w-]+)?(?![\w/-])|\/#work)/g;
function Rich({ text }: { text: string }) {
  const clean = text.replace(/\*\*/g, "");
  const parts = clean.split(LINK);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{p}</Fragment>;
        if (p.startsWith("/")) return <Link key={i} href={p} className="mk-chat-link">{p}</Link>;
        return <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="mk-chat-link">{p.replace(/^https?:\/\/(www\.)?/, "")}</a>;
      })}
    </>
  );
}

export default function ChatWidget() {
  const path = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [leadSaved, setLeadSaved] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const wa = whatsappTo(SETTINGS.whatsappMessage);

  /* Keep the conversation for this browser tab (survives page changes and reloads). */
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null") as { msgs?: Msg[]; leadSaved?: boolean } | null;
      if (saved?.msgs?.length) setMsgs(saved.msgs.slice(-30));
      if (saved?.leadSaved) setLeadSaved(true);
    } catch { /* storage blocked: start fresh */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ msgs: msgs.slice(-30), leadSaved })); } catch { /* ignore */ }
  }, [msgs, leadSaved]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mk:open-chat", onOpen);
    return () => window.removeEventListener("mk:open-chat", onOpen);
  }, []);
  /* Focus the message box on open; give focus back to the chat button on close. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
    else if (wasOpen.current) fab.current?.focus();
    wasOpen.current = open;
  }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy, open]);

  const close = useCallback(() => setOpen(false), []);

  const send = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    if (q.length > MAX) return;
    const next: Msg[] = [...msgs.filter((m) => !m.error), { role: "user", content: q }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10).map(({ role, content }) => ({ role, content })), leadSaved }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string; leadSaved?: boolean };
      if (data.reply) {
        setMsgs((m) => [...m, { role: "assistant", content: data.reply! }]);
        if (data.leadSaved && !leadSaved) { setLeadSaved(true); trackPixel("Lead", { content_name: "Chatbot" }); }
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: data.error || "Something went wrong. Please try again, or message us on WhatsApp.", error: true }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "No connection. Please check your internet and try again.", error: true }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [busy, msgs, leadSaved]);

  if (/^\/admin(\/|$)/.test(path)) return null;
  /* Like the WhatsApp button, the floating button stays off the form pages; the chat still opens from links there. */
  const showFab = !/^\/(start-project|contact)(\/|$)/.test(path);
  const over = text.length > MAX;

  return (
    <>
      {showFab && !open && (
        <button ref={fab} type="button" className={`mk-chat-fab${wa ? "" : " mk-chat-fab--solo"}`} onClick={() => setOpen(true)} aria-label="Open MAKENDLESS Assistant" aria-haspopup="dialog" title="Ask the MAKENDLESS Assistant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.4A7.5 7.5 0 1 1 20 12.5Z" />
            <path d="M12 9v3M10.5 10.5h3" />
          </svg>
        </button>
      )}

      {open && (
        <section className="mk-chat" role="dialog" aria-modal="false" aria-labelledby="mk-chat-title" onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
          <header className="mk-chat-head">
            <span className="mk-chat-dot" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="mk-chat-title" className="mk-chat-title">MAKENDLESS Assistant</h2>
              <p className="mk-chat-sub">AI assistant · replies in seconds</p>
            </div>
            <button type="button" className="mk-chat-x" onClick={close} aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div ref={log} className="mk-chat-log" aria-live="polite" aria-busy={busy}>
            <p className="mk-chat-msg mk-chat-msg--bot">{GREETING}</p>
            {msgs.map((m, i) => (
              <p key={i} className={`mk-chat-msg ${m.role === "user" ? "mk-chat-msg--me" : "mk-chat-msg--bot"}${m.error ? " mk-chat-msg--err" : ""}`}>
                {m.role === "assistant" ? <Rich text={m.content} /> : m.content}
                {m.error && wa && <> <a href={wa} target="_blank" rel="noopener noreferrer" className="mk-chat-link">Open WhatsApp</a></>}
              </p>
            ))}
            {busy && <p className="mk-chat-msg mk-chat-msg--bot mk-chat-typing" aria-label="Assistant is typing"><span /><span /><span /></p>}
          </div>

          {!msgs.some((m) => m.role === "user") && (
            <div className="mk-chat-quick" aria-label="Quick questions">
              {QUICK.map(([label, q]) => <button key={label} type="button" onClick={() => send(q)} disabled={busy}>{label}</button>)}
            </div>
          )}

          <form className="mk-chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <label htmlFor="mk-chat-input" className="sr-only">Your message</label>
            <textarea
              id="mk-chat-input" ref={input} rows={1} value={text} placeholder="Ask about services, prices…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(text); } }}
              aria-describedby="mk-chat-count" aria-invalid={over}
            />
            <button type="submit" className="mk-chat-send" disabled={busy || !text.trim() || over} aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z" /></svg>
            </button>
          </form>
          <p id="mk-chat-count" className={`mk-chat-foot${over ? " mk-chat-foot--over" : ""}`}>
            {text.length > MAX * 0.8 ? `${text.length} / ${MAX} characters${over ? ", please shorten it" : ""}` : "AI can make mistakes. Final prices are confirmed on WhatsApp."}
          </p>
        </section>
      )}
    </>
  );
}
