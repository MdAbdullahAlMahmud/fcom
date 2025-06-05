'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Order, OrderStatus } from '@/types/order'
import { logger } from '@/lib/logger'
import { useToast } from '@/components/ui/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function OrderStatusPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [sendStatusEmail, setSendStatusEmail] = useState(false)
  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      logger.debug('Fetching orders', {
        page: currentPage,
        itemsPerPage,
        statusFilter
      })

      const response = await fetch(
        `/api/admin/orders?page=${currentPage}&limit=${itemsPerPage}${
          statusFilter !== 'all' ? `&status=${statusFilter}` : ''
        }`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        logger.error('Failed to fetch orders', errorData)
        throw new Error(errorData.message || 'Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
      logger.info('Orders fetched successfully', {
        count: data.orders.length,
        totalPages: data.pagination.totalPages
      })
    } catch (error) {
      logger.error('Error fetching orders', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingStatus(true)
      logger.debug('Updating order status', {
        orderId,
        status,
        notes: notes || null
      })

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          status,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        logger.error('Failed to update order status', errorData)
        throw new Error(errorData.message || 'Failed to update order status')
      }

      // Send status update email if checked
      const updatedOrder = orders.find(o => o.id === orderId)
      if (sendStatusEmail && updatedOrder?.user_email) {
        await fetch('/api/invoice-sender/send-generic-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: updatedOrder.user_email,
            subject: `Your Order #${updatedOrder.order_number} status updated to ${status}`,
            companyName: 'fCommerce',
            html: `<p>Dear ${updatedOrder.user_name || 'Customer'},</p><p>Your order <b>#${updatedOrder.order_number}</b> status has been updated to <b>${status}</b>.</p><p>Notes: ${notes || 'N/A'}</p><p>Thank you for shopping with us!</p>`,
            text: `Dear ${updatedOrder.user_name || 'Customer'},\nYour order #${updatedOrder.order_number} status has been updated to ${status}.\nNotes: ${notes || 'N/A'}\nThank you for shopping with us!`,
          }),
        })
      }

      logger.info('Order status updated successfully', {
        orderId,
        status,
        notes: notes || null
      })

      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${status}.`,
      })

      await fetchOrders()
      setIsModalOpen(false)
      setSelectedOrder(null)
      setNotes('')
      setSendStatusEmail(false)
    } catch (error) {
      logger.error('Error updating order status', error)
      setError(error instanceof Error ? error.message : 'Failed to update status')
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update status',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Status Updates</h1>
        <Button variant="outline" onClick={() => router.push('/admin/orders/listing')}>
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <CardTitle>Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by order number, name, or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as OrderStatus | 'all')
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      {order.user_name || 'Guest'}
                      {order.user_email && (
                        <div className="text-sm text-gray-500">
                          {order.user_email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setNotes('')
                          setIsModalOpen(true)
                        }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Update Order Status</DialogTitle>
    </DialogHeader>
    {selectedOrder && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select
            value={selectedStatus || selectedOrder.status}
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            disabled={updatingStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this status change"
            disabled={updatingStatus}
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Status History</h4>
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {selectedOrder.statusHistory?.map((history) => (
              <div key={history.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={getStatusColor(history.status)}>
                      {history.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(history.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    by {history.updated_by_name || 'System'}
                  </p>
                </div>
                {history.notes && (
                  <p className="text-sm mt-2">{history.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="send-status-email"
            checked={sendStatusEmail}
            onChange={e => setSendStatusEmail(e.target.checked)}
            disabled={updatingStatus}
          />
          <label htmlFor="send-status-email" className="text-sm select-none cursor-pointer">
            Send status update email to customer
          </label>
        </div>
      </div>
    )}
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(false)}
        disabled={updatingStatus}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (selectedStatus && selectedOrder) {
            handleStatusChange(selectedOrder.id, selectedStatus)
          }
        }}
        disabled={updatingStatus || !selectedStatus || selectedStatus === selectedOrder?.status}
      >
        Update
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}