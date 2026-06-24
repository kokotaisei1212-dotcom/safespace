import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    // Stripe Identity Verification Session 作成
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'id_number',
      metadata: {
        userId,
        email,
      },
    });

    return NextResponse.json({
      sessionId: verificationSession.id,
      clientSecret: verificationSession.client_secret,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) throw new Error('sessionId required');

    const verificationSession = await stripe.identity.verificationSessions.retrieve(sessionId);

    return NextResponse.json({
      status: verificationSession.status,
      verified: verificationSession.status === 'verified',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
