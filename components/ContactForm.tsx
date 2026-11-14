"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const services = [["create", "CREATE — Video editing"], ["build", "BUILD — Website development"], ["grow", "GROW — Digital marketing (beta interest)"], ["other", "Not sure yet"]];

export default function ContactForm() {
  const params = useSearchParams();
  const pre = (params.get("service") || params.get("for") || "other").split("-")[0];
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = Object.fromEntries(f.entries()) as Record<string, string>;
    const errors: Record<string, string> = {};
    if (!v.name?.trim()) errors.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || "")) errors.email = "Enter a valid email address.";
    if ((v.message || "").trim().length < 10) errors.message = "Tell us a little more (at least 10 characters).";
    setErr(errors);
    if (Object.keys(errors).length) return;
    if (EMAIL) {
      const body = `Name: ${v.name}\nEmail: ${v.email}\nService: ${v.service}\n\n${v.message}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("New project inquiry")}&body=${encodeURIComponent(body)}`;
    }
    setDone(true);
  }

  if (done)
    return (
      <div role="status" className="rounded-3xl border border-[#08bbd4]/40 bg-[#08bbd4]/10 p-8">
        <h2 className="text-2xl font-extrabold">{EMAIL ? "Your email app should be opening." : "Form checked. Delivery channel pending."}</h2>
        <p className="mt-3 text-[#a4aac7]">{EMAIL ? "Send the drafted message to complete your inquiry." : "The inquiry inbox isn't connected yet, so this message was not sent anywhere. The team needs to set NEXT_PUBLIC_CONTACT_EMAIL or a form backend before launch."}</p>
      </div>
    );

  const field = "mt-2 w-full rounded-2xl border border-white/15 bg-[#202342] px-4 py-3.5 text-base text-white placeholder:text-[#a4aac7]/70";
  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <label className="block font-bold">Name<input name="name" autoComplete="name" className={field} aria-invalid={!!err.name} aria-describedby="e-name" />{err.name && <span id="e-name" className="mt-1 block text-sm text-[#ff8aa0]">{err.name}</span>}</label>
      <label className="block font-bold">Email<input name="email" type="email" autoComplete="email" className={field} aria-invalid={!!err.email} aria-describedby="e-email" />{err.email && <span id="e-email" className="mt-1 block text-sm text-[#ff8aa0]">{err.email}</span>}</label>
      <label className="block font-bold">What do you need?<select name="service" defaultValue={services.some(([k]) => k === pre) ? pre : "other"} className={field}>{services.map(([k, l]) => (<option key={k} value={k}>{l}</option>))}</select></label>
      <label className="block font-bold">Tell us what you&apos;re building<textarea name="message" rows={5} className={field} aria-invalid={!!err.message} aria-describedby="e-msg" />{err.message && <span id="e-msg" className="mt-1 block text-sm text-[#ff8aa0]">{err.message}</span>}</label>
      <button className="min-h-12 rounded-full bg-white px-8 py-3.5 text-lg font-extrabold text-[#13172b] hover:bg-[#c7a6ff] sm:w-fit">Start a Project</button>
    </form>
  );
}
