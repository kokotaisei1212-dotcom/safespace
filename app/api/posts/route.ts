import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

export async function POST(req: NextRequest) {
  try {
    const { userId, content, userName } = await req.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      );
    }

    // 新しい投稿を作成
    const postsRef = ref(database, 'posts');
    const newPostRef = push(postsRef);

    await set(newPostRef, {
      id: newPostRef.key,
      userId,
      userName,
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      postId: newPostRef.key,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ posts: [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
