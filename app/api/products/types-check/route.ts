import { NextRequest, NextResponse } from 'next/server';
import { getProductTypesByIds } from '../../../../lib/db/products';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided.' }, { status: 400 });
    }
    // Fetch product types from DB
    const types = await getProductTypesByIds(ids);
    return NextResponse.json({ types });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product types.' }, { status: 500 });
  }
}
