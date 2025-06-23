"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Spinner from "@/components/ui/Spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Building2, Mail, Facebook, AlertCircle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export default function ContentSettingsForm() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(error => {
        toast({
          variant: "destructive",
          title: "Error Loading Settings",
          description: "Failed to load site settings. Please try again.",
        })
        setLoading(false)
      })
  }, [toast])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      
      if (res.ok) {
        toast({
          title: "Settings Updated",
          description: "Your site settings have been saved successfully.",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner size={24} />
        <span>Loading settings...</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex mb-6 bg-slate-50 border-b border-slate-200 rounded-none">
          <TabsTrigger value="basic" className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-blue-600 transition-colors">
            <Building2 className="w-4 h-4" /> Basic Information
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:bg-transparent hover:text-green-600 transition-colors">
            <Mail className="w-4 h-4" /> Contact Information
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 data-[state=active]:bg-transparent hover:text-pink-600 transition-colors">
            <Facebook className="w-4 h-4" /> Social Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="p-0">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about your store that appear throughout the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input 
                  id="site-name"
                  value={settings.site_name || ""}
                  onChange={e => handleChange("site_name", e.target.value)}
                  className="max-w-md"
                  placeholder="Your Store Name"
                />
                <p className="text-sm text-slate-500">The name of your store that appears in the header and title</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea 
                  id="site-description"
                  value={settings.site_description || ""}
                  onChange={e => handleChange("site_description", e.target.value)}
                  placeholder="Brief description of your store"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-slate-500">A short description that appears in search results and meta tags</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="p-0">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input 
                  id="contact-email"
                  type="email"
                  value={settings.contact_email || ""}
                  onChange={e => handleChange("contact_email", e.target.value)}
                  className="max-w-md"
                  placeholder="contact@example.com"
                />
                <p className="text-sm text-slate-500">Primary email for customer inquiries</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input 
                  id="contact-phone"
                  value={settings.contact_phone || ""}
                  onChange={e => handleChange("contact_phone", e.target.value)}
                  className="max-w-md"
                  placeholder="+1 (234) 567-8900"
                />
                <p className="text-sm text-slate-500">Business phone number for customer support</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-address">Shop Address</Label>
                <Textarea 
                  id="shop-address"
                  value={settings.shop_address || ""}
                  onChange={e => handleChange("shop_address", e.target.value)}
                  placeholder="Your store's physical address"
                  className="min-h-[80px]"
                />
                <p className="text-sm text-slate-500">Physical location of your store</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="p-0">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Connect with your customers on social platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input 
                  id="facebook"
                  value={settings.facebook || ""}
                  onChange={e => handleChange("facebook", e.target.value)}
                  className="max-w-md"
                  placeholder="https://facebook.com/your-store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input 
                  id="twitter"
                  value={settings.twitter || ""}
                  onChange={e => handleChange("twitter", e.target.value)}
                  className="max-w-md"
                  placeholder="https://twitter.com/your-store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input 
                  id="instagram"
                  value={settings.instagram || ""}
                  onChange={e => handleChange("instagram", e.target.value)}
                  className="max-w-md"
                  placeholder="https://instagram.com/your-store"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <div className="flex justify-end gap-4 mt-8">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all rounded-xl flex items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size={18} />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
