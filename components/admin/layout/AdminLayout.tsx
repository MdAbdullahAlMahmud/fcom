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
        <Sidebar className="border-r border-slate-200 bg-white shadow-sm max-w-[260px] w-full">
          <SidebarContent className="flex flex-col h-full">

            <div className="flex items-center h-14 px-4 border-b border-slate-200 bg-white">
              <Link href="/admin" className="flex items-center">
                <img
                  src="/dokan_v2.png"
                  alt="Dokan 2.0 Logo"
                  className="h-20 w-auto"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://ui-avatars.com/api/?name=Dokan+2.0&background=1e293b&color=fff&size=32'; }}
                />
                <span className="ml-2 text-sm font-semibold text-slate-800">Admin Panel</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <SidebarGroup>
                <SidebarGroupLabel className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Main Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-2 space-y-1">
                    {/* Dashboard */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive('/admin') 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin" className="flex items-center">
                          <Home className="w-4 h-4 mr-3 flex-shrink-0" />
                          Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Products */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('products')}
                        className={cn(
                          "w-full justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActiveGroup(['/admin/products']) 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Products</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                          expandedMenus.products ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-1 space-y-1 transition-all duration-300",
                        expandedMenus.products ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/products/listing')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/products/create')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                          "w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive('/admin/categories') 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin/categories" className="flex items-center">
                          <Tags className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Categories</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Orders */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('orders')}
                        className={cn(
                          "w-full justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActiveGroup(['/admin/orders']) 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center truncate">
                          <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Orders</span>
                          <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-200 flex-shrink-0">
                            8
                          </Badge>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                          expandedMenus.orders ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-1 space-y-1 transition-all duration-300",
                        expandedMenus.orders ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/orders/listing')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/orders/status')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/orders/shipping')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                          "w-full justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActiveGroup(['/admin/customers']) 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Customers</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                          expandedMenus.customers ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-1 space-y-1 transition-all duration-300",
                        expandedMenus.customers ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/customers/listing')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/customers/create')
                                ? "bg-slate-200 text-slate-800 font-medium"
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

              <SidebarSeparator className="my-4 mx-4" />

              <SidebarGroup>
                <SidebarGroupLabel className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  System
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-2 space-y-1">
                    {/* Payment Accounts */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive('/admin/payment-accounts') 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <Link href="/admin/payment-accounts" className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Payment Accounts</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Settings */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => toggleMenu('settings')}
                        className={cn(
                          "w-full justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActiveGroup(['/admin/settings']) 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate">Settings</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                          expandedMenus.settings ? "rotate-180" : ""
                        )} />
                      </SidebarMenuButton>
                      
                      <SidebarMenuSub className={cn(
                        "ml-7 mt-1 space-y-1 transition-all duration-300",
                        expandedMenus.settings ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton 
                            asChild 
                            className={cn(
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/settings/content')
                                ? "bg-slate-200 text-slate-800 font-medium"
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
                              "w-full px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                              isActive('/admin/settings/pages')
                                ? "bg-slate-200 text-slate-800 font-medium"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <Link href="/admin/settings/pages" className="flex items-center">
                              <span className="truncate">Pages</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>

            <SidebarFooter className="border-t border-slate-100 mt-auto">
              <div className="p-4 text-xs text-slate-500 text-center">
                &copy; {new Date().getFullYear()} Dokan 2.0
              </div>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>

        {/* Main content wrapper */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <header className="absolute top-0 left-0 right-0 z-10 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden p-1.5 hover:bg-slate-100 rounded-md transition-colors" />
              <div>
                <h1 className="text-base font-medium text-slate-800 truncate">
                  {pathname ? (pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) : 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 hidden sm:flex">
                <Search className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff&size=28" alt="Admin" />
                      <AvatarFallback className="bg-slate-800 text-white text-xs font-medium">AD</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium text-slate-700">Admin</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs font-medium">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm">
                    <User className="w-3.5 h-3.5 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 focus:text-red-600">
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-auto pt-14">
            <div className="h-full min-h-full p-3 sm:p-4 md:p-6">
              <div className="h-full bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:p-6">
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