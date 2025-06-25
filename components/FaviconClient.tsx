"use client"
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import React from 'react'

export default function FaviconClient() {
  const settings = useSiteSettings();
  const faviconUrl = settings?.favicon_url
    ? `/uploads/${settings.favicon_url.replace(/^.*[\\/]/, '')}`
    : '/uploads/favicon.png';
  React.useEffect(() => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);
  return null;
}
