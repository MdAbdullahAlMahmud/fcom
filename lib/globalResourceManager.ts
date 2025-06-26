import { query } from '@/lib/db/mysql'

// Simple in-memory cache with TTL
const cache: Record<string, { value: any, expires: number }> = {}
const DEFAULT_TTL = 10 * 60 * 1000 // 10 minutes

async function getCached(key: string, fetcher: () => Promise<any>, ttl = DEFAULT_TTL) {
  const now = Date.now()
  if (cache[key] && cache[key].expires > now) {
    return cache[key].value
  }
  const value = await fetcher()
  cache[key] = { value, expires: now + ttl }
  return value
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  return getCached('all_site_settings', async () => {
    const resultsRaw = await query('SELECT `key`, `value` FROM global_settings')
    const results: any[] = Array.isArray(resultsRaw) ? resultsRaw : [];
    const settings: Record<string, string> = {}
    for (const row of results) {
      settings[row.key] = row.value
    }
    return settings
  })
}

export function invalidateSiteSettingsCache() {
  delete cache['all_site_settings']
}

export async function getFacebookPixelId(): Promise<string | null> {
  return getCached('facebook_pixel_id', async () => {
    const [settings]: any = await query('SELECT pixel_id FROM facebook_pixel_settings WHERE is_active = 1 LIMIT 1')
    return settings?.pixel_id || null
  })
}

export async function getFacebookAccessToken(): Promise<string | null> {
  return getCached('facebook_access_token', async () => {
    const [settings]: any = await query('SELECT access_token FROM facebook_pixel_settings WHERE is_active = 1 LIMIT 1')
    return settings?.access_token || null
  })
}

export async function getWebsiteName(): Promise<string | null> {
  return getCached('website_name', async () => {
    const [settings]: any = await query('SELECT value FROM global_settings WHERE `key` = "website_name" LIMIT 1')
    return settings?.value || null
  })
}

// Add more getters for other meta things as needed, e.g., YouTube, etc.