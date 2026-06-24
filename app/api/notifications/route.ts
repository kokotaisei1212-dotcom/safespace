import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push, set, get } from 'firebase/database';

export async function POST(req: NextRequest) {
  try {
    const { userId, type, fromUserId, postId, message } = await req.json();

    const notificationsRef = ref(database, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);

    await set(newNotificationRef, {
      id: newNotificationRef.key,
      type,
      fromUserId,
      postId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) throw new Error('userId required');

    const notificationsRef = ref(database, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    const notifications = snapshot.val() || {};

    return NextResponse.json({ notifications: Object.values(notifications) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
