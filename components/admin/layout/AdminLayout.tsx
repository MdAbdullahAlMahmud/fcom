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
import { Home, ShoppingCart, Users, FileText, Settings, BarChart3, DollarSign, ChevronDown, LogOut, Tags } from "lucide-react"
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    dashboard: true,
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
      <div className="fixed inset-0 flex bg-muted min-h-screen w-screen">
        {/* Sidebar */}
        <Sidebar className="shadow-lg border-r border-border bg-sidebar h-full min-h-screen" style={{height: '100vh'}}>
          <SidebarContent>
            <div className="flex items-center justify-center h-16 border-b border-border mb-2">
              <Link href="/admin/dashboard/overview" className="text-xl font-extrabold tracking-tight text-primary hover:text-primary/80 transition-colors">
                fCommerce
              </Link>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveGroup(['/admin/dashboard'])}
                      onClick={() => toggleMenu('dashboard')}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link href="/admin/dashboard/overview" className="flex items-center">
                          <Home className="mr-2" />Dashboard
                        </Link>
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedMenus.dashboard ? "transform rotate-180" : ""
                        )} />
                      </div>
                    </SidebarMenuButton>
                    {/* Dashboard Submenu */}
                    <SidebarMenuSub className={cn(
                      "transition-all duration-200",
                      expandedMenus.dashboard ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/overview" isActive={isActive('/admin/dashboard/overview')}>
                          <Link href="/admin/dashboard/overview">Overview</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/statistics" isActive={isActive('/admin/dashboard/statistics')}>
                          <Link href="/admin/dashboard/statistics"><BarChart3 className="mr-2 h-4 w-4" /> Statistics</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/revenue" isActive={isActive('/admin/dashboard/revenue')}>
                          <Link href="/admin/dashboard/revenue"><DollarSign className="mr-2 h-4 w-4" /> Revenue</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveGroup(['/admin/products'])}
                      onClick={() => toggleMenu('products')}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link href="/admin/products/listing" className="flex items-center">
                          <ShoppingCart className="mr-2" />Products
                        </Link>
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedMenus.products ? "transform rotate-180" : ""
                        )} />
                      </div>
                    </SidebarMenuButton>
                    {/* Products Submenu */}
                    <SidebarMenuSub className={cn(
                      "transition-all duration-200",
                      expandedMenus.products ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/products/listing" isActive={isActive('/admin/products/listing')}>
                          <Link href="/admin/products/listing">Product Listing</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/products/create" isActive={isActive('/admin/products/create')}>
                          <Link href="/admin/products/create">Add Product</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive('/admin/categories')}
                    >
                      <Link href="/admin/categories" className="flex items-center">
                        <Tags className="mr-2" />Categories
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveGroup(['/admin/orders'])}
                      onClick={() => toggleMenu('orders')}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link href="/admin/orders/listing" className="flex items-center">
                          <FileText className="mr-2" />Orders
                        </Link>
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedMenus.orders ? "transform rotate-180" : ""
                        )} />
                      </div>
                    </SidebarMenuButton>
                    {/* Orders Submenu */}
                    <SidebarMenuSub className={cn(
                      "transition-all duration-200",
                      expandedMenus.orders ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/listing" isActive={isActive('/admin/orders/listing')}>
                          <Link href="/admin/orders/listing">Order Listing</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/status" isActive={isActive('/admin/orders/status')}>
                          <Link href="/admin/orders/status">Status Updates</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/shipping" isActive={isActive('/admin/orders/shipping')}>
                          <Link href="/admin/orders/shipping">Shipping</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveGroup(['/admin/customers'])}
                      onClick={() => toggleMenu('customers')}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link href="/admin/customers/listing" className="flex items-center">
                          <Users className="mr-2" />Customers
                        </Link>
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedMenus.customers ? "transform rotate-180" : ""
                        )} />
                      </div>
                    </SidebarMenuButton>
                    {/* Customers Submenu */}
                    <SidebarMenuSub className={cn(
                      "transition-all duration-200",
                      expandedMenus.customers ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/customers/listing" isActive={isActive('/admin/customers/listing')}>
                          <Link href="/admin/customers/listing">Customer Listing</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/customers/details" isActive={isActive('/admin/customers/details')}>
                          <Link href="/admin/customers/details">Customer Details</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveGroup(['/admin/settings'])}
                      onClick={() => toggleMenu('settings')}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link href="/admin/settings/content" className="flex items-center">
                          <Settings className="mr-2" />Settings
                        </Link>
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedMenus.settings ? "transform rotate-180" : ""
                        )} />
                      </div>
                    </SidebarMenuButton>
                    {/* Settings Submenu */}
                    <SidebarMenuSub className={cn(
                      "transition-all duration-200",
                      expandedMenus.settings ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    )}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/content" isActive={isActive('/admin/settings/content')}>
                          <Link href="/admin/settings/content">Content Management</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/analytics" isActive={isActive('/admin/settings/analytics')}>
                          <Link href="/admin/settings/analytics">Analytics & Reporting</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/optimization" isActive={isActive('/admin/settings/optimization')}>
                          <Link href="/admin/settings/optimization">Optimization & Polish</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarFooter>
              <div className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} fCommerce</div>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen h-full w-full">
          {/* Header */}
          <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden mr-2" />
              <span className="font-semibold text-lg text-primary">
                {pathname.split('/').pop()?.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') || 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer rounded-full bg-secondary px-3 py-1 hover:bg-accent transition-colors">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=32" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">Admin</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-8 bg-muted min-h-0 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
