import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export default function SiteSettingsExample() {
  const settings = useSiteSettings()
  if (!settings) return null
  return (
    <footer>
      <div>{settings.site_name}</div>
      <div>{settings.shop_address}</div>
      <a href={settings.facebook}>Facebook</a>{' '}
      <a href={settings.twitter}>Twitter</a>{' '}
      <a href={settings.instagram}>Instagram</a>
      <div>Contact: {settings.contact_email}</div>
    </footer>
  )
}
