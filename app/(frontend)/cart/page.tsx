'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">0</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              Discover amazing products and add them to your cart to get started on your shopping journey.
            </p>
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-3 space-y-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm hover:shadow-xl border border-white/50 transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <button className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50">
                      <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1 truncate pr-4">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          {item.sale_price ? (
                            <>
                              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                ৳{Number(item.sale_price).toFixed(2)}
                              </span>
                              <span className="text-slate-400 line-through text-lg">
                                ৳{Number(item.price).toFixed(2)}
                              </span>
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                SALE
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-slate-900">
                              ৳{Number(item.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-100/80 rounded-2xl p-1 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all duration-300 hover:shadow-md"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-bold text-slate-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all duration-300 hover:shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-slate-500 mb-1">Subtotal</div>
                        <div className="text-xl font-bold text-slate-900">
                          ৳{((item.sale_price || item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
                    Order Summary
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">৳{total.toFixed(2)}</span>
                  </div>
                
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-semibold text-slate-900">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ৳{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    onClick={async () => {
                      if (items.length === 0) return;
                      console.log('Proceed to Checkout clicked. Cart items:', items);
                      try {
                        const res = await fetch('/api/products/types-check', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ids: items.map(i => i.id) })
                        });
                        console.log('API response status:', res.status);
                        if (!res.ok) throw new Error('Failed to check product types');
                        const data = await res.json();
                        console.log('Product types from API:', data.types);
                        const types = new Set(data.types);
                        if (types.size > 1) {
                          toast.error('You cannot checkout both digital and physical products at once.');
                          return;
                        }
                        router.push('/checkout');
                      } catch (e) {
                        console.error('Error verifying product types:', e);
                        toast.error('Could not verify product types. Please try again.');
                        return;
                      }
                    }}
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    href="/products"
                    className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-center px-8 py-3 rounded-2xl font-medium transition-all duration-300"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-xs text-slate-500 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Secure SSL Encryption</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>30-Day Money Back Guarantee</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Free Returns & Exchanges</span>
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