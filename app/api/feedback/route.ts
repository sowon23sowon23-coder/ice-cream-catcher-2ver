import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type FeedbackBody = {
  message?: string;
  nickname?: string | null;
  store?: string | null;
  source?: string | null;
};

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let body: FeedbackBody;
  try {
    body = (await req.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (message.length < 5) {
    return NextResponse.json({ error: "Feedback must be at least 5 characters." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server is not configured for feedback." }, { status: 500 });
  }

  const payload = {
    message,
    nickname: (body.nickname || "").trim() || null,
    store: (body.store || "").trim() || null,
    source: (body.source || "").trim() || "home_tool",
    user_agent: req.headers.get("user-agent") || null,
  };

  const attempts = [
    () => supabase.from("user_feedback").insert([payload]),
    () => supabase.from("feedback").insert([payload]),
    () =>
      supabase.from("user_feedback").insert([
        {
          message: payload.message,
          nickname: payload.nickname,
          store: payload.store,
        },
      ]),
    () =>
      supabase.from("feedback").insert([
        {
          message: payload.message,
          nickname: payload.nickname,
          store: payload.store,
        },
      ]),
  ];

  let lastError: string | null = null;
  for (const attempt of attempts) {
    const { error } = await attempt();
    if (!error) {
      return NextResponse.json({ ok: true });
    }
    lastError = error.message;
  }

  return NextResponse.json(
    { error: lastError || "Failed to save feedback." },
    { status: 500 },
  );
}
