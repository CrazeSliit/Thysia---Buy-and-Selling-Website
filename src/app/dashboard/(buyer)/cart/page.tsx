import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CartList from '@/components/dashboard/buyer/CartList'

export default async function BuyerCartPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/cart')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-1">
          Review your items and proceed to checkout
        </p>
      </div>

      {/* Cart List */}
      <CartList />
    </div>
  )
}
