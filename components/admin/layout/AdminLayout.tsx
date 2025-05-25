import React from "react"
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
import { Home, ShoppingCart, Users, FileText, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-muted min-h-screen w-screen">
        {/* Sidebar */}
        <Sidebar className="shadow-lg border-r border-border bg-sidebar h-full min-h-screen" style={{height: '100vh'}}>
          <SidebarContent>
            <div className="flex items-center justify-center h-16 border-b border-border mb-2">
              <span className="text-xl font-extrabold tracking-tight text-primary">fCommerce</span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={true}>
                      <a href="/admin"><Home className="mr-2" />Dashboard</a>
                    </SidebarMenuButton>
                    {/* Dashboard Submenu */}
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/overview">
                          Overview
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/statistics">
                          Statistics
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/dashboard/revenue">
                          Revenue
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/products"><ShoppingCart className="mr-2" />Products</a>
                    </SidebarMenuButton>
                    {/* Products Submenu */}
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/products/listing">
                          Product Listing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/products/create">
                          Add Product
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/products/categories">
                          Categories
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/orders"><FileText className="mr-2" />Orders</a>
                    </SidebarMenuButton>
                    {/* Orders Submenu */}
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/listing">
                          Order Listing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/status">
                          Status Updates
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/orders/shipping">
                          Shipping
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/customers"><Users className="mr-2" />Customers</a>
                    </SidebarMenuButton>
                    {/* Customers Submenu */}
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/customers/listing">
                          Customer Listing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/customers/details">
                          Customer Details
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/settings"><Settings className="mr-2" />Settings</a>
                    </SidebarMenuButton>
                    {/* Settings Submenu */}
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/content">
                          Content Management
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/analytics">
                          Analytics & Reporting
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild href="/admin/settings/optimization">
                          Optimization & Polish
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
              <span className="font-semibold text-lg text-primary">Dashboard</span>
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
