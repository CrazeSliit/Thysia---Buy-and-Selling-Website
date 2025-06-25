import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsView from '@/components/dashboard/buyer/SettingsView'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/settings')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <SettingsView user={session.user} />
    </div>
  )
}
