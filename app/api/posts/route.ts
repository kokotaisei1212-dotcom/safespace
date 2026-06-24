import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
    // GET は別途実装（後で）
    return NextResponse.json({ posts: [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
