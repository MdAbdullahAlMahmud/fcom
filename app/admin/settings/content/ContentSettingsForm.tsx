"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Spinner from "@/components/ui/Spinner"

export default function ContentSettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      setMessage("Settings updated!")
    } else {
      setMessage("Failed to update settings")
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center gap-2"><Spinner size={24} /> Loading...</div>

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" value={settings.site_name || ""} onChange={e => handleChange("site_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea id="site-description" value={settings.site_description || ""} onChange={e => handleChange("site_description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input id="contact-email" type="email" value={settings.contact_email || ""} onChange={e => handleChange("contact_email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-address">Shop Address</Label>
            <Textarea id="shop-address" value={settings.shop_address || ""} onChange={e => handleChange("shop_address", e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" value={settings.facebook || ""} onChange={e => handleChange("facebook", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input id="twitter" value={settings.twitter || ""} onChange={e => handleChange("twitter", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={settings.instagram || ""} onChange={e => handleChange("instagram", e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving && <Spinner size={18} />} {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      {message && <div className="text-green-600 mt-2">{message}</div>}
    </div>
  )
}
