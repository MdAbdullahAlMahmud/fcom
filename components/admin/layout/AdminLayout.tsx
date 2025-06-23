"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar"
import { 
  Home, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  DollarSign, 
  ChevronDown, 
  LogOut, 
  Tags,
  Bell,
  Search,
  User,
  Package
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { Badge } from "@/components/ui/badge"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const settings = useSiteSettings()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: false,
    orders: false,
    customers: false,
    settings: false
  })

  const isActive = (path: string) => pathname === path
  const isActiveGroup = (paths: string[]) => paths.some(path => pathname.startsWith(path))

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }))
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      router.push('/auth/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-slate-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200 bg-white shadow-sm">
          <SidebarContent>
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
              <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                {settings?.site_name || 'Admin Panel'}
              </Link>
            </div>

            <div className="py-6">
              <SidebarGroup>
                <SidebarGroupLabel className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Main Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-4 space-y-2">
                    {/* Dashboard */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "w-full justify-start px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive('/admin') 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin" className="flex items-center">
                          <Home className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Products */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('products')}
                        className={cn(
                          "w-full justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActiveGroup(['/admin/products']) 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-3" />
                          Products
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedMenus.products ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-2 space-y-1 transition-all duration-300",
                        expandedMenus.products ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/products/listing')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/products/listing">Product Listing</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/products/create')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/products/create">Add Product</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>

                    {/* Categories */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "w-full justify-start px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive('/admin/categories') 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin/categories" className="flex items-center">
                          <Tags className="w-4 h-4 mr-3" />
                          Categories
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Orders */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('orders')}
                        className={cn(
                          "w-full justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActiveGroup(['/admin/orders']) 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-3" />
                          Orders
                          <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-200">
                            8
                          </Badge>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedMenus.orders ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-2 space-y-1 transition-all duration-300",
                        expandedMenus.orders ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/orders/listing')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/orders/listing">Order Listing</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/orders/status')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/orders/status">Status Updates</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/orders/shipping')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/orders/shipping">Shipping</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>

                    {/* Customers */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('customers')}
                        className={cn(
                          "w-full justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActiveGroup(['/admin/customers']) 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-3" />
                          Customers
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedMenus.customers ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-2 space-y-1 transition-all duration-300",
                        expandedMenus.customers ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/customers/listing')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/customers/listing">Customer Listing</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/customers/create')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/customers/create">Add Customer</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator className="my-6 mx-4" />

              <SidebarGroup>
                <SidebarGroupLabel className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  System
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-4 space-y-2">
                    {/* Payment Accounts */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "w-full justify-start px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive('/admin/payment-accounts') 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin/payment-accounts" className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-3" />
                          Payment Accounts
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Settings */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('settings')}
                        className={cn(
                          "w-full justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActiveGroup(['/admin/settings']) 
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedMenus.settings ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-2 space-y-1 transition-all duration-300",
                        expandedMenus.settings ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/settings/content')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/settings/content">Site Information</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-4 py-2 text-sm rounded-lg transition-colors",
                              isActive('/admin/settings/pages')
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/settings/pages" className="flex items-center">
                              Pages
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator className="my-6 mx-4" />

              {/* Removed the old 'Pages' sidebar group and its items */}

            </div>

            <SidebarFooter className="border-t border-slate-100 mt-auto">
              <div className="p-4 text-xs text-slate-500 text-center">
                &copy; {new Date().getFullYear()} {settings?.site_name || 'Admin Panel'}
              </div>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>

        {/* Main content wrapper */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <header className="absolute top-0 left-0 right-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {settings?.site_name || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-slate-500">
                  Manage your ecommerce platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                <Search className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-slate-100">
                    <Avatar className="w-8 h-8 border border-slate-200">
                      <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff&size=32" alt="Admin" />
                      <AvatarFallback className="bg-slate-800 text-white text-sm font-medium">AD</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900">Administrator</p>
                      <p className="text-xs text-slate-500">admin@example.com</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-auto pt-16">
            <div className="h-full min-h-full p-6">
              <div className="h-full bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}