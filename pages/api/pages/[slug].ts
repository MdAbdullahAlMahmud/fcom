import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' });
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(filePath)) return res.status(200).json({ content: '' });
      const content = fs.readFileSync(filePath, 'utf8');
      return res.status(200).json({ content });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read file' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { content } = req.body;
      fs.writeFileSync(filePath, content || '', 'utf8');
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to write file' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
