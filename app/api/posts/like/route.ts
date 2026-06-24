import { NextRequest, NextResponse } from 'next/server';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const postRef = ref(database, `posts/${postId}`);
    const postSnap = await get(postRef);
    
    if (!postSnap.exists()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = postSnap.val();
    const likes = (postData.likes || 0) + 1;
    
    await update(postRef, { likes });
    return NextResponse.json({ likes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
