"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type ContactType = "phone" | "email";

type EntryResponse = {
  entryId: number;
  entryCode: string;
  isNew: boolean;
  error?: string;
};

const EMAIL_DOMAIN_OPTIONS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

export default function LoginScreen({
  initialNickname = "",
  stores,
  selectedStore,
  onStoreChange,
  onLogin,
  onDeleteNickname,
  loading = false,
}: {
  initialNickname?: string;
  stores: string[];
  selectedStore: string;
  onStoreChange: (store: string) => void;
  onLogin: (nickname: string) => void | Promise<void>;
  onDeleteNickname?: () => void;
  loading?: boolean;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [lockedStore, setLockedStore] = useState<string | null>(null);
  const [checkingStore, setCheckingStore] = useState(false);
  const [contactType, setContactType] = useState<ContactType>("email");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [contactError, setContactError] = useState<string | null>("Enter a valid email address (e.g. user@example.com).");
  const [entryCode, setEntryCode] = useState<string | null>(null);
  const lastCheckedNick = useRef<string>("");

  useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

  useEffect(() => {
    if (!selectedStore.trim() && stores[0]) {
      onStoreChange(stores[0]);
    }
  }, [onStoreChange, selectedStore, stores]);

  useEffect(() => {
    if (!initialNickname || initialNickname.trim().length < 2) return;
    void lookupStore(initialNickname.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNickname]);

  useEffect(() => {
    if (contactType === "phone") {
      const digits = phoneValue.replace(/\D/g, "");
      if (digits.length === 0) {
        setContactError("Enter a valid US phone number.");
      } else if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith("1"))) {
        setContactError("Enter a valid US phone number.");
      } else {
        setContactError(null);
      }
      return;
    }

    const email = `${emailLocalPart.trim()}@${emailDomain}`;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setContactError(isValid ? null : "Enter a valid email address (e.g. user@example.com).");
  }, [contactType, emailDomain, emailLocalPart, phoneValue]);

  const contactValue = useMemo(() => {
    if (contactType === "phone") return phoneValue.trim();
    return `${emailLocalPart.trim()}@${emailDomain}`;
  }, [contactType, emailDomain, emailLocalPart, phoneValue]);

  const lookupStore = async (trimmed: string) => {
    if (lastCheckedNick.current === trimmed) return;
    lastCheckedNick.current = trimmed;

    setCheckingStore(true);
    try {
      const key = trimmed.toLowerCase();
      const { data } = await supabase
        .from("leaderboard_best_v2")
        .select("store")
        .eq("nickname_key", key)
        .not("store", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1);

      const dbStore = (data?.[0] as { store?: string } | undefined)?.store?.trim();
      if (dbStore && dbStore !== "__ALL__" && stores.includes(dbStore)) {
        setLockedStore(dbStore);
        onStoreChange(dbStore);
      } else {
        setLockedStore(null);
      }
    } catch {
      setLockedStore(null);
    } finally {
      setCheckingStore(false);
    }
  };

  const handleNicknameBlur = () => {
    const trimmed = nickname.trim();
    if (trimmed.length >= 2) {
      void lookupStore(trimmed);
    } else {
      setLockedStore(null);
      lastCheckedNick.current = "";
    }
  };

  const clearNickname = () => {
    setNickname("");
    setNicknameError(null);
    setLockedStore(null);
    lastCheckedNick.current = "";
    onDeleteNickname?.();
  };

  const submit = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      setNicknameError("Nickname must be 2-12 characters.");
      return;
    }

    if (!selectedStore.trim() && stores[0]) {
      onStoreChange(stores[0]);
    }

    if (contactError) {
      return;
    }

    setNicknameError(null);

    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactType,
          contactValue,
          consent: true,
        }),
      });

      const json = (await res.json()) as Partial<EntryResponse> & { error?: string };
      if (!res.ok) {
        setContactError(json.error || "Failed to verify contact.");
        return;
      }

      setEntryCode(json.entryCode ?? null);
      await onLogin(trimmed);
    } catch {
      setContactError("Network error while checking contact.");
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_top,#fff7fb_0%,#f7d8ea_42%,#efb8d4_100%)] p-3">
      <div className="w-full max-w-[380px] rounded-[2rem] border border-[#efbfd7] bg-[linear-gradient(180deg,rgba(255,245,250,0.98),rgba(255,238,247,0.94))] p-5 shadow-[0_28px_60px_rgba(150,9,83,0.18)]">
        <div className="rounded-[1.75rem] border border-[#efbfd7] bg-white/55 p-6 backdrop-blur-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#b22166]">Yogurtland</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-none text-[#5a173b]">Froyo Catcher</h1>
          <p className="mt-4 text-[1.08rem] font-semibold leading-8 text-[#6f4056]">
            Enter your nickname and coupon contact to continue.
          </p>
        </div>

        <div className="mt-5 rounded-[1.55rem] border border-[#efbfd7] bg-white/70 p-5">
          <p className="text-[0.95rem] font-black uppercase tracking-[0.18em] text-[#a50b58]">Nickname</p>
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (nicknameError) setNicknameError(null);
              setLockedStore(null);
              lastCheckedNick.current = "";
            }}
            onBlur={handleNicknameBlur}
            maxLength={12}
            placeholder="2-12 characters"
            className="mt-4 w-full rounded-[1.1rem] border border-[#efbfd7] bg-white px-5 py-4 text-[1.05rem] font-semibold text-[#6a3d54] outline-none placeholder:text-[#98a0b3] focus:border-[#b21b66]"
          />

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="text-[0.92rem] font-medium leading-7 text-[#5f3a4d]">
              <p>One nickname is bound to one</p>
              <p>contact.</p>
            </div>
            {(nickname.trim().length > 0 || initialNickname.trim().length > 0) && (
              <button
                type="button"
                onClick={clearNickname}
                className="text-right text-[0.92rem] font-black leading-6 text-[#c21768] underline underline-offset-4"
              >
                <span className="block">Delete</span>
                <span className="block">saved</span>
              </button>
            )}
          </div>

          {lockedStore ? (
            <p className="mt-3 text-sm font-semibold text-[#7b5870]">
              Store is locked to {lockedStore}.
            </p>
          ) : null}
          {checkingStore ? <p className="mt-3 text-sm font-semibold text-[#7b5870]">Checking store...</p> : null}
          {nicknameError ? <p className="mt-3 text-sm font-bold text-[#c21768]">{nicknameError}</p> : null}
        </div>

        <div className="mt-5 rounded-[1.55rem] border border-[#efbfd7] bg-white/70 p-5">
          <p className="text-[0.95rem] font-black uppercase tracking-[0.18em] text-[#a50b58]">Contact (Coupon)</p>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-[1rem] bg-[#f9dce9] p-1">
            <button
              type="button"
              onClick={() => setContactType("phone")}
              className={`rounded-[0.9rem] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                contactType === "phone"
                  ? "bg-[linear-gradient(135deg,#8d0e50,#bf2e78)] text-white shadow-[0_10px_18px_rgba(150,9,83,0.18)]"
                  : "text-[#8a4164]"
              }`}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => setContactType("email")}
              className={`rounded-[0.9rem] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                contactType === "email"
                  ? "bg-[linear-gradient(135deg,#8d0e50,#bf2e78)] text-white shadow-[0_10px_18px_rgba(150,9,83,0.18)]"
                  : "text-[#8a4164]"
              }`}
            >
              Email
            </button>
          </div>

          {contactType === "phone" ? (
            <input
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              placeholder="(555) 123-4567"
              inputMode="tel"
              autoComplete="tel"
              className="mt-4 w-full rounded-[1rem] border border-[#efbfd7] bg-white px-4 py-4 text-base font-semibold text-[#5f3a4d] outline-none placeholder:text-[#98a0b3] focus:border-[#b21b66]"
            />
          ) : (
            <div className="mt-4 grid grid-cols-[1fr_auto_1.2fr] items-center gap-3">
              <input
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value)}
                placeholder="username"
                autoComplete="email"
                className="rounded-[1rem] border border-[#efbfd7] bg-white px-4 py-4 text-base font-semibold text-[#5f3a4d] outline-none placeholder:text-[#98a0b3] focus:border-[#b21b66]"
              />
              <span className="text-2xl font-black text-[#8d0f52]">@</span>
              <select
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                className="rounded-[1rem] border border-[#efbfd7] bg-white px-4 py-4 text-base font-semibold text-[#5f3a4d] outline-none focus:border-[#b21b66]"
              >
                {EMAIL_DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          )}

          {contactError ? (
            <div className="mt-4 rounded-[1rem] border border-[#efbfd7] bg-[#fff0f7] px-4 py-3 text-[0.95rem] font-semibold leading-7 text-[#c21768]">
              {contactError}
            </div>
          ) : null}

          <p className="mt-4 text-[0.92rem] font-medium text-[#5f3a4d]">
            Used only for digital coupon notification.
          </p>
          {entryCode ? (
            <p className="mt-3 text-sm font-bold text-emerald-700">Entry restored: {entryCode}</p>
          ) : null}
        </div>

        <div className="mt-5 rounded-[1.55rem] border border-[#efbfd7] bg-white/70 p-5">
          <p className="text-[0.92rem] font-medium leading-7 text-[#5f3a4d]">
            Contact change works only when this device already has a valid login session.
          </p>
          <button
            type="button"
            className="mt-4 rounded-[0.9rem] border border-[#efbfd7] bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.06em] text-[#b10f5f]"
          >
            Change Contact
          </button>
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading || checkingStore || Boolean(contactError)}
          className="mt-6 w-full rounded-[1.2rem] bg-[linear-gradient(135deg,#940f57,#cb4b89)] px-4 py-5 text-[1.05rem] font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_28px_rgba(150,9,83,0.22)] disabled:opacity-60"
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </div>
    </main>
  );
}
