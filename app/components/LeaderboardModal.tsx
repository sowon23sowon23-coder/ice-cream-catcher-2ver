"use client";

import { useEffect } from "react";

type CharId = "green" | "berry" | "sprinkle";

export type LeaderRow = {
  rank: number;
  nickname: string;
  score: number;
  date?: string;
  character?: CharId;
};

export type LeaderMode = "today" | "all";

function characterLabel(character?: CharId) {
  if (character === "green") return "Green";
  if (character === "berry") return "Berry";
  if (character === "sprinkle") return "Sprinkle";
  return "-";
}

export default function LeaderboardModal({
  open,
  onClose,
  rows,
  loading = false,
  myNickname,
  myScore,
  myRank,
  mode,
  onModeChange,
}: {
  open: boolean;
  onClose: () => void;
  rows: LeaderRow[];
  loading?: boolean;
  myNickname?: string;
  myScore?: number;
  myRank?: number;
  mode: LeaderMode;
  onModeChange: (m: LeaderMode) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inTop20 = myRank !== undefined ? myRank <= 20 : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#102215]/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-[1.7rem] border border-[#dff2d8] bg-white shadow-[0_24px_50px_rgba(24,90,33,0.3)]">
        <div className="bg-[linear-gradient(135deg,#efffe8,#dbf6ce)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3a8d34]">Top 20</p>
              <h2 className="text-2xl font-black text-[#1f4229]">Leaderboard</h2>
            </div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[#cdebc2] bg-white text-[#356f38] shadow-sm"
              aria-label="close"
              type="button"
            >
              X
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-1 ring-1 ring-[#d9efd1]">
            <button
              type="button"
              onClick={() => onModeChange("today")}
              className={`rounded-lg py-2 text-sm font-black transition ${
                mode === "today" ? "bg-[#72cf49] text-white" : "text-[#3a5b43]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onModeChange("all")}
              className={`rounded-lg py-2 text-sm font-black transition ${
                mode === "all" ? "bg-[#72cf49] text-white" : "text-[#3a5b43]"
              }`}
            >
              All-time
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {(myNickname || myScore !== undefined) && (
            <div className="mb-3 rounded-2xl border border-[#d7efcd] bg-[#f7fff3] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4f9146]">Your best</p>
              <div className="mt-1 flex items-center justify-between">
                <div className="truncate pr-3 font-black text-[#24432f]">{myNickname ?? "-"}</div>
                <div className="text-lg font-black text-[#2f8a3a]">{myScore ?? "-"}</div>
              </div>
              {myRank !== undefined && (
                <p className="mt-2 text-xs font-bold text-[#3c5f46]">
                  Your Rank: <span className="font-black text-[#2e7d35]">#{myRank}</span>{" "}
                  {!inTop20 && <span className="text-[#6f8e76]">(outside Top 20)</span>}
                </p>
              )}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#dff0d9]">
            <div className="grid grid-cols-[52px_1fr_70px_84px] bg-[#f5fff1] px-4 py-3 text-xs font-black text-[#5b7b62]">
              <div>RANK</div>
              <div>NICK</div>
              <div>CHAR</div>
              <div className="text-right">SCORE</div>
            </div>

            {loading ? (
              <div className="px-4 py-6 text-sm font-semibold text-[#607f68]">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="px-4 py-6 text-sm font-semibold text-[#607f68]">No scores yet.</div>
            ) : (
              <div className="max-h-[360px] overflow-auto bg-white">
                {rows.map((r) => {
                  const isMe =
                    myNickname && r.nickname.trim().toLowerCase() === myNickname.trim().toLowerCase();

                  return (
                    <div
                      key={`${r.rank}-${r.nickname}-${r.score}`}
                      className={`grid grid-cols-[52px_1fr_70px_84px] border-t border-[#ecf6e8] px-4 py-3 text-sm ${
                        isMe ? "bg-[#f3ffee]" : ""
                      }`}
                    >
                      <div className="font-black text-[#355c41]">{r.rank}</div>
                      <div className="truncate font-bold text-[#243e2f]">
                        {r.nickname}
                        {isMe ? <span className="ml-2 text-xs font-black text-[#2f8a3a]">YOU</span> : null}
                        {r.date ? <span className="ml-2 text-xs font-semibold text-[#8aa290]">{r.date}</span> : null}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#3d6047]">
                        {r.character ? (
                          <img
                            src={`/${r.character}.png`}
                            alt={r.character}
                            className="h-5 w-5 rounded-full bg-white"
                            draggable={false}
                          />
                        ) : null}
                        <span className="truncate">{characterLabel(r.character)}</span>
                      </div>
                      <div className="text-right font-black text-[#23412d]">{r.score}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl border border-[#d8efd0] bg-[#f6fff3] px-4 py-3 font-black text-[#34573f]"
            type="button"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
