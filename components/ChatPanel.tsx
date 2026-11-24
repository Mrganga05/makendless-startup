"use client";
/* The MAKENDLESS Assistant chat window. Loaded only when the chat is opened (see components/ChatWidget.tsx).
   Talks to /api/chat (the Anthropic key stays on the server). Pages the assistant points to arrive as `links`
   and show as buttons ("See video prices"), never as raw paths. Quick replies stay under every answer. */
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { SETTINGS, whatsappTo } from "../data/settings";
import { WHATSAPP, linkLabel, splitLinks } from "../lib/chat-links";
import { trackPixel } from "./MetaPixel";

type Msg = { role: "user" | "assistant"; content: string; links?: string[]; error?: boolean };
const KEY = "mk-chat-v1";
const MAX = 1000;
const GREETING = "Hi! I'm the MAKENDLESS Assistant. Ask me about our video editing, websites, AI assistants, prices or how a project works.";
const QUICK: [string, string][] = [
  ["Services", "What services do you offer?"],
  ["Pricing", "What are your prices?"],
  ["See our work", "Can I see your work?"],
  ["Contact", "How can I contact the team?"],
];

/* Plain text with outside links (for example a sample on YouTube) clickable; markdown stars dropped.
   Older saved chats may still hold raw paths: those become friendly words via splitLinks. */
const EXT = /(https?:\/\/[^\s)]+[^\s).,!?])/g;
function Rich({ text }: { text: string }) {
  const parts = splitLinks(text.replace(/\*\*/g, "")).text.split(EXT);
  return (
    <>
      {parts.map((p, i) => i % 2 === 0
        ? <Fragment key={i}>{p}</Fragment>
        : <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="mk-chat-link">{p.replace(/^https?:\/\/(www\.)?/, "")}</a>)}
    </>
  );
}

function LinkButtons({ links, wa, onGo }: { links: string[]; wa: string; onGo: () => void }) {
  const items = links.map((l) => ({ l, label: linkLabel(l) })).filter((x) => x.label && (x.l !== WHATSAPP || wa));
  if (!items.length) return null;
  return (
    <span className="mk-chat-links">
      {items.map(({ l, label }) => l === WHATSAPP
        ? <a key={l} href={wa} target="_blank" rel="noopener noreferrer" className="mk-chat-btn mk-chat-btn--wa">{label}</a>
        : <Link key={l} href={l} className="mk-chat-btn" onClick={onGo}>{label} <span aria-hidden="true">→</span></Link>)}
    </span>
  );
}

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [leadSaved, setLeadSaved] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const wa = whatsappTo(SETTINGS.whatsappMessage);

  /* Keep the conversation for this browser tab (survives page changes and reloads). */
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null") as { msgs?: Msg[]; leadSaved?: boolean } | null;
      if (saved?.msgs?.length) setMsgs(saved.msgs.slice(-30));
      if (saved?.leadSaved) setLeadSaved(true);
    } catch { /* storage blocked: start fresh */ }
    requestAnimationFrame(() => input.current?.focus());
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ msgs: msgs.slice(-30), leadSaved })); } catch { /* ignore */ }
  }, [msgs, leadSaved]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

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
      const data = (await res.json().catch(() => ({}))) as { reply?: string; links?: string[]; error?: string; leadSaved?: boolean };
      if (data.reply) {
        const links = Array.isArray(data.links) ? data.links.filter((l) => typeof l === "string").slice(0, 3) : [];
        setMsgs((m) => [...m, { role: "assistant", content: data.reply!, links }]);
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

  const over = text.length > MAX;

  return (
    <section className="mk-chat" role="dialog" aria-modal="false" aria-labelledby="mk-chat-title" onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <header className="mk-chat-head">
        <span className="mk-chat-dot" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="mk-chat-title" className="mk-chat-title">MAKENDLESS Assistant</h2>
          <p className="mk-chat-sub">AI assistant · replies in seconds</p>
        </div>
        <button type="button" className="mk-chat-x" onClick={onClose} aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div ref={log} className="mk-chat-log" aria-live="polite" aria-busy={busy}>
        <p className="mk-chat-msg mk-chat-msg--bot">{GREETING}</p>
        {msgs.map((m, i) => (
          <div key={i} className={`mk-chat-msg ${m.role === "user" ? "mk-chat-msg--me" : "mk-chat-msg--bot"}${m.error ? " mk-chat-msg--err" : ""}`}>
            {m.role === "assistant" ? <Rich text={m.content} /> : m.content}
            {m.role === "assistant" && !m.error && m.links?.length ? <LinkButtons links={m.links} wa={wa} onGo={onClose} /> : null}
            {m.error && wa && <> <a href={wa} target="_blank" rel="noopener noreferrer" className="mk-chat-link">Open WhatsApp</a></>}
          </div>
        ))}
        {busy && <p className="mk-chat-msg mk-chat-msg--bot mk-chat-typing" aria-label="Assistant is typing"><span /><span /><span /></p>}
      </div>

      {/* Quick replies stay visible under every answer. */}
      <div className="mk-chat-quick" role="group" aria-label="Quick questions">
        {QUICK.map(([label, q]) => <button key={label} type="button" onClick={() => send(q)} disabled={busy}>{label}</button>)}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mk-chat-quick-wa">Chat on WhatsApp</a>}
      </div>

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
  );
}
