import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BuyerOverviewCards from '@/components/dashboard/buyer/BuyerOverviewCards'
import RecentOrdersList from '@/components/dashboard/buyer/RecentOrdersList'
import PersonalizedRecommendations from '@/components/dashboard/buyer/PersonalizedRecommendations'
import QuickActions from '@/components/dashboard/buyer/QuickActions'

export default async function BuyerDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  const userId = session.user.id

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user.name}!
            </h1>            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <BuyerOverviewCards userId={userId} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <RecentOrdersList userId={userId} />

        {/* Personalized Recommendations */}
        <div className="lg:col-span-1">
          <PersonalizedRecommendations userId={userId} />
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Discover More Features
          </h3>
          <p className="text-gray-600 mb-4">
            Explore all the tools available to enhance your shopping experience
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard/buyer/wishlist"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              💖 Wishlist
            </a>
            <a
              href="/dashboard/buyer/addresses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              📍 Addresses
            </a>
            <a
              href="/dashboard/buyer/reviews"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
            >
              ⭐ Reviews
            </a>
            <a
              href="/dashboard/buyer/inbox"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
            >
              💬 Messages
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
