import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

type Rule = { intent: string; keywords: string[]; reply: string };

function normalize(text: string) {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  return ` ${clean} `;
}

// Test ke liye: browser mein /api/chat kholein
export async function GET() {
  const rows = await sql`SELECT COUNT(*) AS total FROM rules`;
  return NextResponse.json({ connected: true, rules: rows[0].total });
}

export async function POST(req: Request) {
  const { message } = await req.json();
  const text = normalize(String(message ?? ""));

  const rules = (await sql`SELECT intent, keywords, reply FROM rules ORDER BY id`) as Rule[];

  const match = rules.find((rule) =>
    rule.keywords.some((k) => text.includes(normalize(k)))
  );

  return NextResponse.json({
    intent: match?.intent ?? "fallback",
    reply:
      match?.reply ??
      "Sorry, I didn't understand that. Try asking about places, food, weather, kinnow, the university, or emergency numbers.",
  });
}