import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BuyerAddressList from '@/components/dashboard/buyer/BuyerAddressList'

export default async function BuyerAddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/addresses')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Addresses</h1>
            <p className="text-gray-600 mt-1">
              Manage your saved shipping addresses
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">📍 Add multiple addresses</p>
          </div>
        </div>
      </div>

      {/* Address List */}
      <BuyerAddressList userId={session.user.id} />
    </div>
  )
}
