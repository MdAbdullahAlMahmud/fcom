"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PAGE_LABELS: Record<string, string> = {
  contact: "Contact Us",
  about: "About Us",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

export default function AdminPageEditor() {
  const router = useRouter();
  const pathname = usePathname();
  const slug = pathname ? pathname.split("/").pop() || "contact" : "contact";
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to backend
    setTimeout(() => {
      setSaving(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="p-8 shadow-xl rounded-2xl border border-slate-200 bg-white">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">
          {PAGE_LABELS[slug] || "Page"}
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          Edit the content for your {PAGE_LABELS[slug]?.toLowerCase() || slug} page. Changes are live after saving.
        </p>
        <Textarea
          className="w-full min-h-[200px] mb-4 text-base font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Enter ${PAGE_LABELS[slug]?.toLowerCase() || slug} content...`}
        />
        <div className="flex items-center gap-4 mt-2">
          <Button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg text-base font-semibold">
            {saving ? "Saving..." : "Save"}
          </Button>
          {lastUpdated && (
            <span className="text-xs text-slate-400">Last updated: {lastUpdated.toLocaleString()}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
