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
    <div className="marketing-shell min-h-screen text-white">
      <div className="marketing-grid pointer-events-none fixed inset-0 opacity-30" />
      <Sidebar profile={profile} user={user} />

      <main className="relative z-10 min-h-screen px-4 pb-10 pt-20 md:px-8 lg:ml-72 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-[1180px]">
          {children}
        </div>
      </main>
    </div>
  )
}
