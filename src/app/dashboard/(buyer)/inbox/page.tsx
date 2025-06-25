import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import InboxView from '@/components/dashboard/buyer/InboxView'

export default async function InboxPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/inbox')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Communicate with sellers and get support
        </p>
      </div>

      <InboxView userId={session.user.id} />
    </div>
  )
}
