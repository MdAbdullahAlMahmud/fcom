import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/mysql';

// POST /api/verify-trxid
export async function POST(request: Request) {
  try {
    const { TrxID, amount, phone, user_id, name } = await request.json();
    if (!TrxID || !amount) {
      return NextResponse.json({ success: false, message: 'TrxID and amount are required.' }, { status: 400 });
    }

    // Find the transaction
    const result = await query(
      'SELECT * FROM stored_data WHERE TrxID = ? LIMIT 1',
      [TrxID]
    );
    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Transaction ID not found.' }, { status: 404 });
    }
    const trx = rows[0] as { amount: string, status: string, id: number, user_id: number | null }; // add other fields as needed
    if (parseFloat(trx.amount) < parseFloat(amount)) {
      return NextResponse.json({ success: false, message: 'Amount is less than order total.' }, { status: 400 });
    }
    if (trx.status === 'verified' && trx.user_id != null) {
      return NextResponse.json({ success: false, message: 'This transaction ID is already used.' }, { status: 400 });
    }

    // Update the transaction as verified
    await query(
      'UPDATE stored_data SET status = ?, verification_time = NOW(), phone = ?, user_id = ?, name = ? WHERE id = ?',
      ['verified', phone || null, user_id || null, name || null, trx.id]
    );

    return NextResponse.json({ success: true, message: 'Transaction verified successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
