import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Protect all /dashboard routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen hero-bg">
      {/* Sidebar Component */}
      <Sidebar profile={profile} user={user} />

      {/* Main Content Area */}
      <main className="lg:ml-64 p-4 md:p-8 min-h-screen">
        <div className="max-w-6xl mx-auto pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
