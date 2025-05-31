"use client"
// Admin page for managing Bkash/Nagad payment accounts
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PaymentAccount {
  id: number;
  provider: 'bKash' | 'Nagad';
  phone_number: string;
}

export default function PaymentAccountsPage() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ [provider: string]: string }>({ bKash: '', Nagad: '' });
  const [saving, setSaving] = useState<{ [provider: string]: boolean }>({ bKash: false, Nagad: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payment-accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          setForm({
            bKash: data.accounts.find((a: PaymentAccount) => a.provider === 'bKash')?.phone_number || '',
            Nagad: data.accounts.find((a: PaymentAccount) => a.provider === 'Nagad')?.phone_number || '',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (provider: 'bKash' | 'Nagad', value: string) => {
    setForm((prev) => ({ ...prev, [provider]: value }));
  };

  const handleSave = async (provider: 'bKash' | 'Nagad') => {
    setSaving((prev) => ({ ...prev, [provider]: true }));
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/payment-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, phone_number: form[provider] }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${provider} number updated successfully.`);
        setAccounts((prev) => {
          const others = prev.filter((a) => a.provider !== provider);
          return [...others, { id: data.id, provider, phone_number: form[provider] }];
        });
      } else {
        setError(data.message || 'Failed to update.');
      }
    } catch (e) {
      setError('Failed to update.');
    }
    setSaving((prev) => ({ ...prev, [provider]: false }));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bkash/Nagad Accounts</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="space-y-8">
        {(['bKash', 'Nagad'] as const).map((provider) => (
          <div key={provider} className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">{provider} Account</h2>
            <label className="block mb-2">Phone Number</label>
            <Input
              type="text"
              value={form[provider]}
              onChange={(e) => handleChange(provider, e.target.value)}
              placeholder={`Enter ${provider} number`}
              maxLength={20}
            />
            <Button
              className="mt-3"
              onClick={() => handleSave(provider)}
              disabled={saving[provider]}
            >
              {saving[provider] ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
