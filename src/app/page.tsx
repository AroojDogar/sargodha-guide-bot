"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
};

type Topic = {
  label: string;
  query: string;
  icon: string;
  description: string;
};

const GREETING_MESSAGE =
  "Assalam o Alaikum! I'm your Sargodha City Guide. Pick a topic below or ask me anything about the city.";

const FALLBACK_MESSAGE =
  "Sorry, I didn't understand that yet. Try asking about places, food, shopping, weather, the university, kinnow, or emergency numbers.";

const TYPING_DELAY = 700;

const TOPICS: Topic[] = [
  { label: "About", query: "Tell me about Sargodha", icon: "🦅", description: "The City of Eagles" },
  { label: "Places", query: "Places to visit", icon: "🏛️", description: "Parks & landmarks" },
  { label: "Food", query: "Where to eat", icon: "🍛", description: "Local flavours" },
  { label: "Shopping", query: "Shopping", icon: "🛍️", description: "Bazaars & markets" },
  { label: "Kinnow", query: "Kinnow", icon: "🍊", description: "Citrus capital" },
  { label: "Weather", query: "Weather", icon: "⛅", description: "Seasons & climate" },
  { label: "University", query: "University", icon: "🎓", description: "University of Sargodha" },
  { label: "Emergency", query: "Emergency numbers", icon: "🚑", description: "Rescue & police" },
];

const FACTS = [
  { label: "Province", value: "Punjab" },
  { label: "Known for", value: "Kinnow" },
  { label: "Best season", value: "Nov – Feb" },
  { label: "Rescue", value: "1122" },
];

// ---------- Chatbot logic ----------

async function getBotReply(userText: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });
    if (!res.ok) return FALLBACK_MESSAGE;
    const data: { reply?: string } = await res.json();
    return data.reply ?? FALLBACK_MESSAGE;
  } catch {
    return "Sorry, I can't connect right now. Please try again in a moment.";
  }
}
function currentTime(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}


// ---------- Small UI pieces ----------

function BotAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg shadow-sm">
      🦅
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.27 3.13a59.77 59.77 0 0 1 18.22 8.87 59.77 59.77 0 0 1-18.22 8.88L6 12Zm0 0h7.5" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.02 9.35h4.99V4.36M2.99 19.64v-4.99h4.99m-5.31-5.67a8.25 8.25 0 0 1 13.8-3.7l3.18 3.18M3.31 14.65l3.18 3.18a8.25 8.25 0 0 0 13.8-3.7" />
    </svg>
  );
}

// ---------- Page ----------

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show the greeting when the page opens (on the client, so the time is correct)
  useEffect(() => {
    setMessages([{ id: nextId.current++, sender: "bot", text: GREETING_MESSAGE, time: currentTime() }]);
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

   async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId.current++, sender: "user", text, time: currentTime() }]);
    setInput("");
    setIsTyping(true);

    // Database se jawab aur typing delay dono ka intezar
    const [reply] = await Promise.all([
      getBotReply(text),
      new Promise((resolve) => {
        typingTimer.current = setTimeout(resolve, TYPING_DELAY);
      }),
    ]);

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, sender: "bot", text: reply, time: currentTime() },
    ]);
    setIsTyping(false);
    inputRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Enter key also submits
    sendMessage(input);
  }

  function clearChat() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(false);
    setInput("");
    nextId.current = 1;
    setMessages([{ id: nextId.current++, sender: "bot", text: GREETING_MESSAGE, time: currentTime() }]);
    inputRef.current?.focus();
  }

  const showWelcome = messages.length <= 1 && !isTyping;

  return (
    <main className="h-dvh lg:p-6">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden bg-white shadow-2xl shadow-slate-300/60 lg:rounded-3xl">
        {/* ===== Sidebar (desktop) ===== */}
        <aside className="relative hidden w-80 shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-800 p-6 text-white lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />

          {/* Brand */}
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/20">
              🦅
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Sargodha City Guide</h1>
              <p className="text-xs text-emerald-200">City of Eagles · Punjab</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Welcome</p>
            <h2 className="mt-2 text-2xl font-bold leading-snug">
              Discover the citrus capital of Pakistan.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
              Places, food, weather, and essential info — all in one chat.
            </p>
          </div>

          {/* Quick facts */}
          <div className="relative mt-6 grid grid-cols-2 gap-2">
            {FACTS.map((fact) => (
              <div key={fact.label} className="rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10">
                <p className="text-[11px] uppercase tracking-wide text-emerald-200">{fact.label}</p>
                <p className="text-sm font-semibold">{fact.value}</p>
              </div>
            ))}
          </div>

          {/* Topics */}
          <p className="relative mt-8 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Explore
          </p>
          <nav className="relative mt-3 space-y-1">
            {TOPICS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => sendMessage(topic.query)}
                disabled={isTyping}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 disabled:opacity-50"
              >
                <span className="text-lg">{topic.icon}</span>
                <span className="font-medium">{topic.label}</span>
              </button>
            ))}
          </nav>

          <p className="relative mt-auto pt-6 text-xs text-emerald-200/70">
            Rule-based assistant · Information may change, please verify locally.
          </p>
        </aside>

        {/* ===== Chat panel ===== */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BotAvatar />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  <span className="lg:hidden">Sargodha City Guide</span>
                  <span className="hidden lg:inline">City Guide Assistant</span>
                </h2>
                <p className="text-xs text-green-600">{isTyping ? "Typing..." : "Online"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ResetIcon />
              Clear chat
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((message) =>
                message.sender === "bot" ? (
                  <div key={message.id} className="flex items-end gap-2.5">
                    <BotAvatar />
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                        {message.text}
                      </div>
                      <p className="mt-1 pl-1 text-[11px] text-slate-400">City Guide · {message.time}</p>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                        {message.text}
                      </div>
                      <p className="mt-1 pr-1 text-right text-[11px] text-slate-400">You · {message.time}</p>
                    </div>
                  </div>
                )
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <BotAvatar />
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
                  </div>
                </div>
              )}

              {/* Welcome topic cards */}
              {showWelcome && (
                <div className="pt-2">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Explore Sargodha
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => sendMessage(topic.query)}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                      >
                        <span className="text-2xl">{topic.icon}</span>
                        <p className="mt-2 text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                          {topic.label}
                        </p>
                        <p className="text-xs text-slate-500">{topic.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {/* Topic chips (mobile only, after the chat starts) */}
              {!showWelcome && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => sendMessage(topic.query)}
                      disabled={isTyping}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <span>{topic.icon}</span>
                      {topic.label}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-1.5 pl-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about places, food, weather..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="hidden sm:inline">Send</span>
                  <SendIcon />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Press Enter to send
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}