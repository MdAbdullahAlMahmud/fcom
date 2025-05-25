import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Package } from "lucide-react"

export default function OrderListingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Button>
          <Package className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Order ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">#ORD-{i.toString().padStart(4, '0')}</td>
                    <td className="p-4">Customer {i}</td>
                    <td className="p-4">2024-03-{i.toString().padStart(2, '0')}</td>
                    <td className="p-4">${(i * 199.99).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        Processing
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 