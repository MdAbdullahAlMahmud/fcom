'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, Mail, Phone, Search } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  last_order_date: string | null
  created_at: string
}

export default function CustomerListingPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 10
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce function to limit API calls during rapid input changes
  const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }, [])

  // Fetch customers from the API
  const fetchCustomers = useCallback(
    async (query: string, page: number, onSuccess?: () => void) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        })
        if (query) {
          params.append('search', query)
        }

        const response = await fetch(`/api/admin/customers?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
          },
        })
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }

        const data = await response.json()
        setCustomers(data.customers)
        setTotalPages(data.pagination.totalPages)
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage]
  )

  // Debounced version of fetchCustomers to prevent excessive API calls
  const debouncedFetchCustomers = useCallback(
    debounce((query: string, page: number) => {
      fetchCustomers(query, page, () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      })
    }, 500),
    [fetchCustomers]
  )

  // Fetch data when searchQuery or currentPage changes
  useEffect(() => {
    debouncedFetchCustomers(searchQuery, currentPage)
  }, [searchQuery, currentPage, debouncedFetchCustomers])

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              ref={searchInputRef}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading customers...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>{customer.total_orders}</TableCell>
                        <TableCell>{formatCurrency(customer.total_spent)}</TableCell>
                        <TableCell>
                          {customer.last_order_date ? formatDate(customer.last_order_date) : 'No orders'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/customers/${customer.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}