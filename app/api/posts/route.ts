import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const posts = await db.posts.all();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const { userId, username, content } = await req.json();
  if (!content || !userId || !username) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const post = await db.posts.create({ userId, username, content });
  return NextResponse.json({ success: true, post });
}
