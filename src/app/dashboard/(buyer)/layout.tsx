import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface BuyerLayoutProps {
  children: React.ReactNode
}

export default async function BuyerLayout({ children }: BuyerLayoutProps) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer')
  }

  // Check if user has BUYER role
  if (session.user?.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout userRole="BUYER">
      {children}
    </DashboardLayout>
  )
}
