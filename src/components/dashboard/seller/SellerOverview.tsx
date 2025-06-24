import { Suspense } from 'react'
import { DollarSign, Package, ShoppingBag, TrendingUp, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import RecentOrders from './RecentOrders'
import ProductPerformance from './ProductPerformance'
import SalesChart from './SalesChart'

interface SellerOverviewProps {
  userId: string
}

// Loading component for async data
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-secondary-200 rounded"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick stats component
async function QuickStats({ userId }: { userId: string }) {
  // Fetch real data from API
  let sellerStats;
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/seller/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      sellerStats = data.stats;
    } else {
      throw new Error('Failed to fetch stats');
    }
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    // Fallback to placeholder data if API fails
    sellerStats = {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalProducts: 0,
      thisMonthOrders: 0,
      orderCountGrowth: 0,
      conversionRate: 0,
      totalItemsSold: 0,
      itemsGrowth: 0
    };
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${sellerStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${sellerStats.revenueGrowth >= 0 ? '+' : ''}${sellerStats.revenueGrowth}%`,
      changeType: sellerStats.revenueGrowth >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Products Listed',
      value: sellerStats.totalProducts.toString(),
      change: `${sellerStats.totalProducts} total`,
      changeType: 'neutral' as const,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Orders This Month',
      value: sellerStats.thisMonthOrders.toString(),
      change: `${sellerStats.orderCountGrowth >= 0 ? '+' : ''}${sellerStats.orderCountGrowth}%`,
      changeType: sellerStats.orderCountGrowth >= 0 ? 'positive' as const : 'negative' as const,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Items Sold Total',
      value: sellerStats.totalItemsSold.toString(),
      change: `${sellerStats.itemsGrowth >= 0 ? '+' : ''}${sellerStats.itemsGrowth}%`,
      changeType: sellerStats.itemsGrowth >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.title}</p>                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.changeType === 'neutral' ? stat.change : `${stat.change} from last month`}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function QuickActions() {
  const actions = [
    {
      title: 'Add New Product',
      description: 'List a new product in your store',
      href: '/dashboard/seller/products/new',
      icon: Plus,
      bgColor: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600',
    },
    {
      title: 'View Storefront',
      description: 'See how customers view your store',
      href: '/seller/store', // TODO: Create seller storefront
      icon: Eye,
      bgColor: 'bg-secondary-500',
      hoverColor: 'hover:bg-secondary-600',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`p-4 rounded-lg text-white ${action.bgColor} ${action.hoverColor} transition-colors duration-200 group`}
            >
              <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 mr-2" />
                <span className="font-medium">{action.title}</span>
              </div>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function SellerOverview({ userId }: SellerOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <Suspense fallback={<StatsLoading />}>
        <QuickStats userId={userId} />
      </Suspense>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-secondary-900">Sales Overview</h2>
          </div>
          <Suspense fallback={<div className="p-6">Loading chart...</div>}>
            <SalesChart userId={userId} />
          </Suspense>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
              <Link 
                href="/dashboard/seller/orders"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <Suspense fallback={<div className="p-6">Loading orders...</div>}>
            <RecentOrders userId={userId} />
          </Suspense>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Product Performance</h2>
            <Link 
              href="/dashboard/seller/products"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Manage products
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="p-6">Loading products...</div>}>
          <ProductPerformance userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
