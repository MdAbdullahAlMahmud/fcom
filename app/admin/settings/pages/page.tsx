"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SimpleTabs } from "@/components/ui/simple-tabs";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const PAGE_KEYS = [
  { key: "contact", label: "Contact Us" },
  { key: "about", label: "About Us" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
];

export default function AdminPagesSettings() {
  const [activeTab, setActiveTab] = useState("contact");
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Record<string, Date | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load content from API when tab changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/pages/${activeTab}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setContent((prev) => ({ ...prev, [activeTab]: data.content || "" }));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load content. " + err.message);
        setLoading(false);
      });
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content[activeTab] || "" }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      setLastUpdated((prev) => ({ ...prev, [activeTab]: new Date() }));
    } catch (err: any) {
      setError("Failed to save content. " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 pb-16">
      <Card className="p-10 shadow-2xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <h1 className="text-2xl font-bold mb-2 text-slate-800 flex items-center gap-2">
          <span>Static Pages Management</span>
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Edit the content of your site's static pages. Use the tabs to switch between pages. All changes are live after saving.
        </p>
        <SimpleTabs tabs={PAGE_KEYS} value={activeTab} onChange={setActiveTab} />
        <div className="mb-10 mt-4 min-h-[320px] pb-4">
          {error ? (
            <div className="text-red-500 text-center py-16 text-lg">{error}</div>
          ) : loading ? (
            <div className="text-slate-400 text-center py-16 text-lg">Loading...</div>
          ) : (
            <ReactQuill
              theme="snow"
              value={content[activeTab] || ""}
              onChange={(val: string) => setContent((prev) => ({ ...prev, [activeTab]: val }))}
              className="bg-white rounded-xl border border-slate-200 min-h-[300px] text-base"
              style={{ minHeight: 300 }}
            />
          )}
        </div>
        <div className="flex items-center gap-6 mt-4">
          <Button onClick={handleSave} disabled={saving || loading} className="px-8 py-3 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {lastUpdated[activeTab] && (
            <span className="text-xs text-slate-400">Last updated: {lastUpdated[activeTab]?.toLocaleString()}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
