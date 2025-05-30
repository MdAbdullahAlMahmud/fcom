// lib/utils/sqlUtils.ts
export function buildUpdateQuery(table: string, fields: { [key: string]: any }, whereClause: string, whereValues: any[]) {
    const setClauses = Object.keys(fields)
      .filter(key => fields[key] !== null && fields[key] !== undefined)
      .map(key => (key === 'updated_at' ? `${key} = NOW()` : `${key} = ?`))
      .join(', ');
  
    const values = Object.keys(fields)
      .filter(key => fields[key] !== null && fields[key] !== undefined && key !== 'updated_at')
      .map(key => fields[key]);
  
    const query = `UPDATE ${table} SET ${setClauses} WHERE ${whereClause}`;
    return { query, values: [...values, ...whereValues] };
  }
  