import { NextResponse } from 'next/server'
import { getAllSiteSettings, invalidateSiteSettingsCache } from '@/lib/globalResourceManager'
import { query } from '@/lib/db/mysql'

export async function GET() {
  try {
    const settings = await getAllSiteSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json()
    for (const [key, value] of Object.entries(updates)) {
      await query('UPDATE global_settings SET value = ? WHERE `key` = ?', [value, key])
    }
    invalidateSiteSettingsCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 })
  }
}
