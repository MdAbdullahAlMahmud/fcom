import { query } from '../db';

/**
 * Fetches product types for the given product IDs.
 * @param ids Array of product IDs
 * @returns Array of product types (e.g., ['default', 'digital', ...])
 */
export async function getProductTypesByIds(ids: (string|number)[]): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  // Use parameterized query to prevent SQL injection
  const placeholders = ids.map(() => '?').join(',');
  const sql = `SELECT product_type FROM products WHERE id IN (${placeholders})`;
  const rows = await query(sql, ids);
  // rows: { product_type: string }[]
  return Array.from(new Set((rows as any[]).map(r => r.product_type || 'default')));
}
