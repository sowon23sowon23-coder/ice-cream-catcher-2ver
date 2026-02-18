"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../lib/gtag";

type CharId = "green" | "berry" | "sprinkle";
type GameMode = "free" | "mission" | "timeAttack";

type CharacterOption = {
  id: CharId;
  label: string;
  flavor: string;
  accent: string;
};

type ModeOption = {
  id: GameMode;
  label: string;
  detail: string;
};

const CHARACTERS: CharacterOption[] = [
  { id: "green", label: "Pistachio", flavor: "Smooth and steady", accent: "var(--yl-green)" },
  { id: "berry", label: "Berry Burst", flavor: "Fast and lively", accent: "var(--yl-berry)" },
  { id: "sprinkle", label: "Sprinkle Pop", flavor: "Playful and bright", accent: "var(--yl-yellow)" },
];

const MODES: ModeOption[] = [
  { id: "free", label: "Free Play", detail: "Catch as many as you can." },
  { id: "mission", label: "Mission", detail: "Catch only target toppings." },
  { id: "timeAttack", label: "Time Attack", detail: "30 seconds to set your best." },
];

export default function HomeScreen({
  bestScore,
  onStart,
  onOpenLeaderboard,
}: {
  bestScore: number;
  onStart: (character: CharId, mode: GameMode) => void;
  onOpenLeaderboard: () => void;
}) {
  const [character, setCharacter] = useState<CharId>("green");
  const [mode, setMode] = useState<GameMode>("free");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedNick = (localStorage.getItem("nickname") || "").trim();
    const savedChar = localStorage.getItem("selectedCharacter") as CharId | null;
    const savedMode = localStorage.getItem("selectedMode") as GameMode | null;

    if (savedNick) setNickname(savedNick);
    if (savedChar && CHARACTERS.some((c) => c.id === savedChar)) setCharacter(savedChar);
    if (savedMode && MODES.some((m) => m.id === savedMode)) setMode(savedMode);
  }, []);

  const selectedCharacter = useMemo(
    () => CHARACTERS.find((c) => c.id === character) ?? CHARACTERS[0],
    [character]
  );

  const startGame = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      setError("Nickname must be 2-12 characters.");
      return;
    }

    setError(null);
    localStorage.setItem("nickname", trimmed);
    localStorage.setItem("selectedCharacter", character);
    localStorage.setItem("selectedMode", mode);

    trackEvent({
      action: "home_start_click",
      category: "engagement",
      label: `${character}_${mode}`,
    });

    onStart(character, mode);
  };

  return (
    <main className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_12%_8%,#ffffff_0%,#ecfff5_35%,#d6f8e8_100%)] p-5">
      <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/70 blur-2xl" />
      <div className="pointer-events-none absolute -left-14 bottom-10 h-44 w-44 rounded-full bg-[#9ee86b]/30 blur-2xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-sm flex-col">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(63,164,66,0.24)]">
              <span className="text-xl">🍦</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#23742a]">Yogurtland</p>
              <h1 className="text-xl font-black text-[#1f3f2c]">Ice Cream Catcher</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="rounded-full border border-[#bcecb0] bg-white px-3 py-2 text-xs font-black text-[#2a7b2d] shadow-sm transition hover:-translate-y-0.5"
          >
            Leaderboard
          </button>
        </header>

        <section className="mb-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(37,136,53,0.18)] backdrop-blur-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#398f37]">20th Anniversary Vibes</p>
          <h2 className="mt-1 text-3xl font-black leading-[1.08] text-[#1e3b2a]">Catch. Score. Celebrate.</h2>
          <p className="mt-2 text-sm font-semibold text-[#3c5c46]">
            Inspired by Yogurtland&apos;s bright store look and promo energy.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f4fff0] px-4 py-3 ring-1 ring-[#daf5cf]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#3f9340]">Best Score</p>
              <p className="text-2xl font-black text-[#215127]">{bestScore}</p>
            </div>
            <span className="rounded-full bg-[#73cf48] px-3 py-1 text-xs font-black text-white">Real Rewards Mode</span>
          </div>
        </section>

        <section className="mb-3">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#3b8838]">Pick your cup</p>
          <div className="grid grid-cols-3 gap-2">
            {CHARACTERS.map((c) => {
              const active = c.id === character;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharacter(c.id)}
                  className={`rounded-2xl border bg-white px-2 py-2 text-center transition ${
                    active
                      ? "-translate-y-0.5 border-[#79d854] shadow-[0_10px_24px_rgba(72,175,53,0.24)]"
                      : "border-white/70 hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className="mx-auto mb-1 grid h-11 w-11 place-items-center rounded-2xl"
                    style={{ background: `${c.accent}22` }}
                  >
                    <img src={`/${c.id}.png`} alt={c.label} className="h-10 w-10 select-none" draggable={false} />
                  </div>
                  <p className="text-[11px] font-black text-[#244a31]">{c.label}</p>
                  <p className="text-[10px] font-bold text-[#5a7a66]">{c.flavor}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-3 rounded-2xl border border-white/70 bg-white/80 p-3">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#3b8838]">Game mode</p>
          <div className="space-y-2">
            {MODES.map((m) => {
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left transition ${
                    active
                      ? "bg-[#74cf47] text-white shadow-[0_8px_16px_rgba(50,141,45,0.35)]"
                      : "bg-[#f6fff3] text-[#30543a] hover:bg-[#ecfce6]"
                  }`}
                >
                  <p className="text-sm font-black">{m.label}</p>
                  <p className={`text-xs font-semibold ${active ? "text-white/90" : "text-[#4a6c56]"}`}>{m.detail}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-auto rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_8px_22px_rgba(63,164,66,0.14)]">
          <label htmlFor="nickname" className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#356b35]">
            Nickname
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="2-12 characters"
            className="w-full rounded-xl border border-[#ccebc2] bg-[#fafff8] px-3 py-2 text-sm font-semibold text-[#214128] outline-none focus:border-[#78d654]"
          />
          {error ? <p className="mt-1 text-xs font-bold text-[#c13f63]">{error}</p> : null}

          <button
            type="button"
            onClick={startGame}
            className="mt-3 w-full rounded-xl bg-[linear-gradient(135deg,#7ddd4f,#4cbf4e)] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_24px_rgba(56,155,53,0.35)] transition hover:-translate-y-0.5"
          >
            Start Game
          </button>
          <p className="mt-2 text-center text-[11px] font-bold text-[#58745f]">
            Selected: {selectedCharacter.label} · {MODES.find((m) => m.id === mode)?.label}
          </p>
        </section>
      </div>
    </main>
  );
}
