import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrdersList from '@/components/dashboard/buyer/OrdersList'

export default async function BuyerOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/orders')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">
          Track and manage all your orders in one place
        </p>
      </div>

      {/* Orders List */}
      <OrdersList userId={session.user.id} />
    </div>
  )
}
