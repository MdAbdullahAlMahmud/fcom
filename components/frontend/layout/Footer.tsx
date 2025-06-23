"use client"

import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield,
  Truck,
  CreditCard,
  Award,
  Clock,
  Users
} from 'lucide-react'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const settings = useSiteSettings()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      {/* Trust Badges Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">Secure Shopping</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Free Shipping</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">24/7 Support</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-700">Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

    {/* Main Footer Content */}
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
        {/* Left: Company Info & Newsletter */}
        <div className="text-left">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
            {settings?.site_name || ''}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {settings?.site_description || "Your trusted e-commerce partner delivering quality products worldwide. We're committed to providing exceptional shopping experiences."}
          </p>

          <h4 className="font-semibold mb-3 text-purple-700">Stay Updated</h4>
          <div className="flex w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:border-purple-500 text-gray-900 placeholder-gray-500"
            />
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-r-lg transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>

        {/* Center: Quick Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
          <ul className="space-y-3">
            {[
              { label: 'Track Order', href: '/track-order' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact Us', href: '/contact' }
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-300 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Contact Info */}
        <div className="text-right">
          <h4 className="font-semibold mb-4 text-gray-900">Shop Info</h4>
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-end items-center space-x-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <span className="text-sm">{settings?.contact_email || ''}</span>
            </div>
            <div className="flex justify-end items-center space-x-2">
              <Phone className="w-5 h-5 text-purple-600" />
              <span className="text-sm">{settings?.contact_phone || ''}</span>
            </div>
            <div className="flex justify-end items-start space-x-2">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              <span className="text-sm text-right">
                {settings?.shop_address?.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                )) || (
                  <>
                    
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">We Accept:</span>
              <div className="flex space-x-2 ml-2">
                {['Visa', 'MC', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay'].map((payment) => (
                  <div key={payment} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-300">
                    {payment}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Trusted by 50,000+ customers worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-300 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} {settings?.site_name || ''}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' }
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}