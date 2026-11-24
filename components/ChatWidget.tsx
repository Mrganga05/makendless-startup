"use client";
/* MAKENDLESS Assistant launcher: only the small round chat button (stacked above the WhatsApp button) loads with the page.
   The chat window itself (components/ChatPanel.tsx) is downloaded the first time someone opens it, so it never slows
   the page down. Any element can open it with openChat() (window event "mk:open-chat"). */
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SETTINGS, whatsappTo } from "../data/settings";

const loadPanel = () => import("./ChatPanel");
const ChatPanel = dynamic(loadPanel, { ssr: false, loading: () => <p className="mk-chat-loading" role="status">Opening the assistant…</p> });

export function openChat() {
  window.dispatchEvent(new CustomEvent("mk:open-chat"));
}

export default function ChatWidget() {
  const path = usePathname() || "";
  const [open, setOpen] = useState(false);
  const fab = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const wa = whatsappTo(SETTINGS.whatsappMessage);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mk:open-chat", onOpen);
    return () => window.removeEventListener("mk:open-chat", onOpen);
  }, []);
  /* Give focus back to the chat button when the window closes. */
  useEffect(() => {
    if (!open && wasOpen.current) fab.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const close = useCallback(() => setOpen(false), []);

  if (/^\/admin(\/|$)/.test(path)) return null;
  /* Like the WhatsApp button, the floating button stays off the form pages; the chat still opens from links there. */
  const showFab = !/^\/(start-project|contact)(\/|$)/.test(path);

  return (
    <>
      {showFab && !open && (
        <button ref={fab} type="button" className={`mk-chat-fab${wa ? "" : " mk-chat-fab--solo"}`} onClick={() => setOpen(true)}
          onPointerEnter={() => { void loadPanel(); }} onFocus={() => { void loadPanel(); }}
          aria-label="Open MAKENDLESS Assistant" aria-haspopup="dialog" title="Ask the MAKENDLESS Assistant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.4A7.5 7.5 0 1 1 20 12.5Z" />
            <path d="M12 9v3M10.5 10.5h3" />
          </svg>
        </button>
      )}
      {open && <ChatPanel onClose={close} />}
    </>
  );
}
