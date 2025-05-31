'use client'

import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Payment option types
const PAYMENT_OPTIONS = [
  { key: 'cod', label: 'Cash on Delivery' },
  { key: 'online', label: 'Online Payment (bKash/Nagad)' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'cod' | 'online'>('cod');
  const [paymentAccounts, setPaymentAccounts] = useState<{ provider: string; phone_number: string }[]>([]);
  const [trxId, setTrxId] = useState('');
  const [trxVerified, setTrxVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [trxError, setTrxError] = useState('');

  // Fetch payment accounts on mount or when payment option changes
  useEffect(() => {
    if (paymentOption === 'online') {
      fetch('/api/payment-accounts')
        .then(res => res.json())
        .then(data => {
          if (data.success) setPaymentAccounts(data.accounts || []);
        });
    }
  }, [paymentOption]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh'
  })

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart to continue shopping.</p>
        <button
          onClick={() => router.push('/products')}
          className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  const validateForm = () => {
    console.log('Validating form data:', formData)
    
    if (!formData.full_name.trim()) {
      console.log('Validation failed: Full name is empty')
      toast.error('Full name is required')
      return false
    }
    if (!formData.phone.trim()) {
      console.log('Validation failed: Phone is empty')
      toast.error('Phone number is required')
      return false
    }
    if (!/^01[3-9]\d{6,8}$/.test(formData.phone)) {
      console.log('Validation failed: Invalid phone format:', formData.phone)
      const currentLength = formData.phone.length
      if (currentLength < 10) {
        toast.error(`Phone number must be at least 10 digits. Current length: ${currentLength}`)
      } else if (currentLength > 11) {
        toast.error(`Phone number must not exceed 11 digits. Current length: ${currentLength}`)
      } else {
        toast.error('Please enter a valid Bangladeshi phone number starting with 01 followed by 3-9')
      }
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      console.log('Validation failed: Invalid email format:', formData.email)
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.address_line1.trim()) {
      console.log('Validation failed: Address line 1 is empty')
      toast.error('Address line 1 is required')
      return false
    }
    if (!formData.city.trim()) {
      console.log('Validation failed: City is empty')
      toast.error('City is required')
      return false
    }
    if (!formData.state.trim()) {
      console.log('Validation failed: State is empty')
      toast.error('State/Province is required')
      return false
    }
    if (!formData.postal_code.trim()) {
      console.log('Validation failed: Postal code is empty')
      toast.error('Postal code is required')
      return false
    }
    
    console.log('Form validation passed')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (paymentOption === 'online' && !trxVerified) {
      toast.error('Please verify your Transaction ID before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Format the address as expected by the API
      const formattedAddress = [
        formData.address_line1,
        [
          formData.address_line2,
          formData.city,
          formData.state,
          formData.postal_code
        ].filter(Boolean).join(', ')
      ].filter(Boolean).join('\n');

      const requestData: any = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.sale_price || item.price
        })),
        total,
        customer: {
          name: formData.full_name,
          email: formData.email || `${formData.phone}@temp.com`,
          phone: formData.phone,
          address: formattedAddress
        },
        payment_method: paymentOption,
      };
      if (paymentOption === 'online') {
        requestData.trxId = trxId;
      }
      const response = await fetch('/api/frontend/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to create order');
      }
      const { orderNumber, trackingNumber } = responseData;
      clearCart();
      router.push(`/order/success?orderNumber=${orderNumber}&trackingNumber=${trackingNumber}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log('Form field changed:', name, value)
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      console.log('Updated form data:', newData)
      return newData
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Details</h3>
              <div>
                <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white px-8 py-3 rounded-full transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Payment Options + Order Summary */}
        <div className="space-y-6">
          {/* Payment Option Cards */}
          <div className="flex gap-4">
            {PAYMENT_OPTIONS.map(opt => (
              <div
                key={opt.key}
                className={`flex-1 cursor-pointer border-2 rounded-lg p-4 text-center transition-all duration-200 ${paymentOption === opt.key ? 'border-indigo-600 bg-indigo-50 shadow' : 'border-gray-200 bg-white'}`}
                onClick={() => {
                  setPaymentOption(opt.key as 'cod' | 'online');
                  setTrxId('');
                  setTrxVerified(false);
                  setTrxError('');
                }}
              >
                <div className="font-semibold text-lg mb-2">{opt.label}</div>
                {paymentOption === opt.key && (
                  <div className="text-indigo-600 font-bold">Selected</div>
                )}
              </div>
            ))}
          </div>

          {/* Online Payment Instructions */}
          {paymentOption === 'online' && (
            <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-4">
              <h3 className="font-semibold text-lg mb-2">Send Money Instructions</h3>
              <ol className="list-decimal pl-5 mb-2 text-sm text-gray-700">
                <li>Send the amount to the number below.</li>
                <li>Use <b>bKash</b> or <b>Nagad</b> Send Money - Personal.</li>
                <li>After sending the money, fill in your <b>Transaction ID</b>.</li>
                <li>Click the <b>Verify</b> button.</li>
                <li>
                  <b>bKash</b> &amp; <b>Nagad</b> numbers:
                  <div className="flex gap-4 mt-2">
                    {['bKash', 'Nagad'].map(provider => {
                      const acc = paymentAccounts.find(a => a.provider === provider);
                      return acc ? (
                        <div key={provider} className="border rounded p-2 flex flex-col items-center">
                          <div className="font-bold">{provider}</div>
                          <div className="text-lg font-mono select-all">{acc.phone_number}</div>
                          <button
                            type="button"
                            className="mt-1 text-xs text-blue-600 underline"
                            onClick={() => {
                              navigator.clipboard.writeText(acc.phone_number);
                              toast.success(`${provider} number copied!`);
                            }}
                          >Copy</button>
                          {/* QR code button placeholder */}
                        </div>
                      ) : null;
                    })}
                  </div>
                </li>
              </ol>
              <div className="mb-2 text-sm">Product Amount: <span className="font-semibold">{total.toFixed(2)} BDT</span></div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="border rounded px-2 py-1 flex-1"
                  value={trxId}
                  onChange={e => { setTrxId(e.target.value); setTrxVerified(false); setTrxError(''); }}
                  disabled={trxVerified}
                />
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  onClick={async () => {
                    setIsVerifying(true);
                    setTrxError('');
                    try {
                      const res = await fetch('/api/verify-trxid', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          TrxID: trxId,
                          amount: total,
                          phone: formData.phone,
                          user_id: null, // You can set user_id if available
                          name: formData.full_name,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setTrxVerified(true);
                        toast.success('Transaction verified successfully!');
                      } else {
                        setTrxVerified(false);
                        setTrxError(data.message || 'Verification failed');
                        toast.error(data.message || 'Verification failed');
                      }
                    } catch (err) {
                      setTrxVerified(false);
                      setTrxError('Verification failed');
                      toast.error('Verification failed');
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  disabled={isVerifying || !trxId}
                >
                  {trxVerified ? 'Verified' : isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              {trxError && <div className="text-red-600 text-xs mb-2">{trxError}</div>}
              {trxVerified && <div className="text-green-600 text-xs mb-2">Transaction ID verified!</div>}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 