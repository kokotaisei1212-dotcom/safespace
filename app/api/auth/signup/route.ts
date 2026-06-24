import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    // Firebase で登録
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // ユーザー情報を Realtime Database に保存
    await set(ref(database, `users/${user.uid}`), {
      id: user.uid,
      email,
      name,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      userId: user.uid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
