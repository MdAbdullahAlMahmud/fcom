import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';

// GET /api/payment-accounts
export async function GET() {
  try {
    const result = await query(
      'SELECT id, provider, phone_number FROM payment_accounts ORDER BY provider ASC'
    );
    return NextResponse.json({ success: true, accounts: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/payment-accounts
export async function POST(request: Request) {
  try {
    const { provider, phone_number } = await request.json();
    if (!provider || !phone_number) {
      return NextResponse.json({ success: false, message: 'Provider and phone number are required.' }, { status: 400 });
    }
    // Atomic upsert: insert or update in one query
    await query(
      'INSERT INTO payment_accounts (provider, phone_number) VALUES (?, ?) ON DUPLICATE KEY UPDATE phone_number = VALUES(phone_number)',
      [provider, phone_number]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
