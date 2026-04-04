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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ff88] selection:text-black">
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-10" />
      
      <Sidebar profile={profile} user={user} />

      <main className="relative z-10 min-h-screen px-4 pb-24 pt-24 md:px-12 lg:ml-[280px] lg:px-24 lg:pt-16">
        <div className="mx-auto w-full max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  )
}
