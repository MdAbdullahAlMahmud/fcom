// scripts/exportSchema.js
// node scripts/exportSchema.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = 'fcommerce';
const OUTPUT_FILE = path.join(__dirname, '../schema.md');

async function exportSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: DB_NAME,
  });

  const [tables] = await connection.execute(`SHOW TABLES`);
  const tableKey = `Tables_in_${DB_NAME}`;

  let md = `# Database Schema for \`${DB_NAME}\`\n\n`;

  for (const row of tables) {
    const tableName = row[tableKey];
    md += `## Table: \`${tableName}\`\n\n`;
    md += `| Column | Type | Null | Key | Default | Extra |\n`;
    md += `|--------|------|------|-----|---------|-------|\n`;

    const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${tableName}\``);

    for (const col of columns) {
      md += `| ${col.Field} | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default ?? ''} | ${col.Extra} |\n`;
    }

    md += `\n`;
  }

  await connection.end();

  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`✅ Schema exported to ${OUTPUT_FILE}`);
}

exportSchema().catch(err => {
  console.error('❌ Error exporting schema:', err);
});
