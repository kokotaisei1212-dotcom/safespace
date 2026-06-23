import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await kv.set(`verify:${email}`, code, { ex: 600 });

  console.log(`Code for ${email}: ${code}`);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { email, code } = await req.json();

  const stored = await kv.get<string>(`verify:${email}`);
  if (!stored) return NextResponse.json({ error: "No code found" }, { status: 400 });
  if (stored !== code) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await kv.del(`verify:${email}`);
  await db.users.verify(email);
  return NextResponse.json({ success: true });
}
