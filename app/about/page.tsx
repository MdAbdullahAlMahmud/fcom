"use client";
import { useEffect, useState } from "react";
import Header from '@/components/frontend/layout/Header';
import Footer from '@/components/frontend/layout/Footer';

export default function AboutPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pages/about")
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content || "");
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load content.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : !content ? (
          <div className="text-slate-400">No content found.</div>
        ) : (
          <div className="prose prose-lg max-w-2xl w-full mx-auto p-6 bg-white rounded-xl shadow">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
