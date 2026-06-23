import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await db.users.findByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const user = await db.users.create({ username, email, password, verified: false });
  return NextResponse.json({ success: true, userId: user.id });
}
