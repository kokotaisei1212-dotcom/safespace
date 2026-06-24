import { NextRequest, NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Notification } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const notifRef = ref(database, 'notifications');
    const snapshot = await get(notifRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const notifications: Notification[] = [];
    snapshot.forEach((child) => {
      const notif = child.val();
      if (notif.userId === userId) {
        notifications.push({ id: child.key || '', ...notif });
      }
    });

    return NextResponse.json(notifications.sort((a, b) => b.timestamp - a.timestamp));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
