'use client'

import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Payment option types
const PAYMENT_OPTIONS = [
  { key: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { key: 'online', label: 'Online Payment (bKash/Nagad)', icon: '📱' },
];

const SHIPPING_OPTIONS = [
  { key: 'inside_dhaka', label: 'Inside Dhaka', cost: 90, deliveryTime: '1-2 days', icon: '🏢' },
  { key: 'outside_dhaka', label: 'Outside Dhaka', cost: 150, deliveryTime: '3-5 days', icon: '🚚' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'cod' | 'online'>('cod');
  const [shippingOption, setShippingOption] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentAccounts, setPaymentAccounts] = useState<{ provider: string; phone_number: string }[]>([]);
  const [trxId, setTrxId] = useState('');
  const [trxVerified, setTrxVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [trxError, setTrxError] = useState('');

  // Calculate shipping cost
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.key === shippingOption)?.cost || 0;
  const finalTotal = total + shippingCost;

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to continue shopping.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
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

    // Email validation is mandatory,it should be valid email address

    if (formData.email && formData.email.trim() === '') {
      console.log('Validation failed: Email is empty')
      toast.error('Please enter your email address')
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
        total: finalTotal,
        shipping_fee: shippingCost,
        shipping_type: shippingOption,
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


      const now = new Date();
      const invoicePayload = {
        customer: {
          name: formData.full_name,
          email: formData.email || `${formData.phone}@temp.com`,
          phone: formData.phone,
          address: formattedAddress,
        },
        invoice: {
          number: orderNumber || '',
          date: now.toISOString().slice(0, 10),
          items: items.map(item => ({
            name: item.name || '',
            quantity: item.quantity || 0,
            unit_price: item.sale_price || item.price || 0,
            total: ((item.sale_price || item.price) * item.quantity) || 0,
          })),
          subtotal: total || 0,
          discount: 0, // Add discount logic if available
          tax: 0,      // Add tax logic if available
          shippingFee: shippingCost || 0,
          shippingMethod: SHIPPING_OPTIONS.find(opt => opt.key === shippingOption)?.label || '',
          total: finalTotal || 0,
          paymentMethod: paymentOption || '',
          thankYou: `Thank you for shopping with us!`,
        },
        company: {
          name: 'fCommerce',
          contact: '',
          phone: '',
        },
      };

      // Send invoice creation request
      const res = await fetch('/api/invoice-sender/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload),
      });

      if (!res.ok) {
        // Optionally handle the error (e.g., show message or log)
        console.error('Invoice sending failed:', await res.json());
      } else {
        // Only clear cart after successful invoice creation
        clearCart();
        router.push(`/order/success?orderNumber=${orderNumber}&trackingNumber=${trackingNumber}`);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Order Form */}
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Address Details</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="address_line1"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      required
                      placeholder="House/Flat number, Street name"
                    />
                  </div>
                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="address_line2"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                        required
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                        required
                        placeholder="Enter state/province"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                        required
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Shipping Options</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SHIPPING_OPTIONS.map(option => (
                    <div
                      key={option.key}
                      className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                        shippingOption === option.key 
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => setShippingOption(option.key as 'inside_dhaka' | 'outside_dhaka')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{option.icon}</span>
                          <div>
                            <div className="font-bold text-lg text-gray-800">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.deliveryTime}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-800">৳{option.cost}</div>
                          {shippingOption === option.key && (
                            <div className="text-purple-600 font-semibold text-sm">Selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Place Order • ৳${finalTotal.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Payment Options + Order Summary */}
          <div className="space-y-8">
            {/* Payment Option Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h3>
              <div className="space-y-4">
                {PAYMENT_OPTIONS.map(opt => (
                  <div
                    key={opt.key}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                      paymentOption === opt.key 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setPaymentOption(opt.key as 'cod' | 'online');
                      setTrxId('');
                      setTrxVerified(false);
                      setTrxError('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{opt.icon}</span>
                        <span className="font-semibold text-gray-800">{opt.label}</span>
                      </div>
                      {paymentOption === opt.key && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Payment Instructions */}
            {paymentOption === 'online' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-blue-200">
                <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">📱</span>
                  Payment Instructions
                </h3>
                <div className="bg-white rounded-xl p-4 mb-4">
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                    <li>Send the exact amount to one of the numbers below</li>
                    <li>Use <strong>bKash</strong> or <strong>Nagad</strong> Send Money - Personal</li>
                    <li>After sending, enter your <strong>Transaction ID</strong></li>
                    <li>Click <strong>Verify</strong> to confirm payment</li>
                  </ol>
                </div>
                
                <div className="mb-4">
                  <div className="text-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 mb-4">
                    <div className="text-sm text-gray-600">Amount to Send</div>
                    <div className="text-2xl font-bold text-green-700">৳{finalTotal.toFixed(2)}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['bKash', 'Nagad'].map(provider => {
                      const acc = paymentAccounts.find(a => a.provider === provider);
                      return acc ? (
                        <div key={provider} className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                          <div className="font-bold text-lg text-gray-800 mb-2">{provider}</div>
                          <div className="text-xl font-mono font-bold text-blue-600 mb-2 select-all bg-gray-50 rounded-lg py-2 px-3">
                            {acc.phone_number}
                          </div>
                          <button
                            type="button"
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(acc.phone_number);
                              toast.success(`${provider} number copied!`);
                            }}
                          >
                            📋 Copy Number
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter Transaction ID"
                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors"
                      value={trxId}
                      onChange={e => { setTrxId(e.target.value); setTrxVerified(false); setTrxError(''); }}
                      disabled={trxVerified}
                    />
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        trxVerified 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                      onClick={async () => {
                        setIsVerifying(true);
                        setTrxError('');
                        try {
                          const res = await fetch('/api/verify-trxid', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              TrxID: trxId,
                              amount: finalTotal,
                              phone: formData.phone,
                              user_id: null,
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
                      {trxVerified ? '✓ Verified' : isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  {trxError && (
                    <div className="text-red-600 text-sm bg-red-50 rounded-lg p-2 mt-2">
                      ❌ {trxError}
                    </div>
                  )}
                  {trxVerified && (
                    <div className="text-green-600 text-sm bg-green-50 rounded-lg p-2 mt-2">
                      ✅ Transaction ID verified successfully!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">📦</span>
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ৳{(item.sale_price || item.price).toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ৳{((item.sale_price || item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping ({SHIPPING_OPTIONS.find(opt => opt.key === shippingOption)?.label})</span>
                    <span>৳{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">৳{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}