import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';

// GET /api/admin/bkash-nagad/transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const company = searchParams.get('company'); // 'bkash' or 'nagad' or undefined
    const status = searchParams.get('status'); // 'verified', 'not verified', or undefined
    const sort = searchParams.get('sort') || 'latest'; // 'latest', 'amount_asc', 'amount_desc'

    const whereClause = [];
    const params: any[] = [];
    if (company) {
      whereClause.push('text_company = ?');
      params.push(company);
    }
    if (status) {
      whereClause.push('status = ?');
      params.push(status);
    }
    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    let orderSQL = 'ORDER BY id DESC';
    if (sort === 'amount_asc') orderSQL = 'ORDER BY CAST(amount AS DECIMAL(10,2)) ASC';
    if (sort === 'amount_desc') orderSQL = 'ORDER BY CAST(amount AS DECIMAL(10,2)) DESC';

    // Get total count
    const [countRow] = await query(
      `SELECT COUNT(*) as total FROM stored_data ${whereSQL}`,
      params
    ) as any[];
    const total = countRow?.total || 0;

    // Get paginated data
    const trxRows = await query(
      `SELECT * FROM stored_data ${whereSQL} ${orderSQL} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ) as any[];

    // For verified, fetch order_number from orders table by TrxID = tracking_id
    const results = await Promise.all(
      trxRows.map(async (row) => {
        let order_number = null;
        if (row.status === 'verified' && row.TrxID) {
          const [order] = await query(
            'SELECT order_number FROM orders WHERE tracking_id = ? LIMIT 1',
            [row.TrxID]
          ) as any[];
          order_number = order?.order_number || null;
        }
        return { ...row, order_number };
      })
    );

    return NextResponse.json({
      transactions: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bKash/Nagad transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
