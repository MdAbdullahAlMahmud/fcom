import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

const MAX_SIZE = 128 * 1024; // 128KB
const ALLOWED_TYPES = ['image/png'];
const ALLOWED_EXTS = ['.png'];

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get('favicon') as File;
  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, message: 'Only PNG files are allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, message: 'File too large. Max 128KB.' }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) {
    return NextResponse.json({ success: false, message: 'Only .png extension is allowed.' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Save to public/uploads/favicon.png
  const outPath = path.join(process.cwd(), 'public', 'uploads', 'favicon.png');
  await writeFile(outPath, buffer);
  return NextResponse.json({ success: true, url: 'favicon.png' });
};
