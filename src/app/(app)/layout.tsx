import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SessionTimeoutProvider } from '@/components/auth/SessionTimeoutProvider';

// Tailor-facing routes use Client Components (CSR) per spec §3.6.
// This layout is a Server Component that provides auth context to children,
// then children themselves are 'use client' components.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let { data: profile } = await supabase
    .from('users')
    .select('name, plan, status')
    .eq('id', user.id)
    .maybeSingle();

  // Self-heal: if handle_new_user trigger did not run, create the profile row
  if (!profile) {
    const defaultName =
      user.user_metadata?.name || user.email?.split('@')[0] || 'Tailor';

    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: defaultName,
        role: 'tailor',
        plan: 'free',
        status: 'active',
      })
      .select('name, plan, status')
      .single();

    if (!insertError && newProfile) {
      profile = newProfile;
    }
  }

  if (profile?.status === 'suspended') {
    redirect('/suspended');
  }

  // Fallback in case DB query completely failed
  const profileName = profile?.name ?? user.user_metadata?.name ?? 'Tailor';
  const profilePlan = profile?.plan ?? 'free';

  return (
    <SessionTimeoutProvider role="tailor">
      <div className="min-h-screen text-slate-900 flex flex-col selection:bg-[#1b5e20] selection:text-white">
        <AppHeader name={profileName} plan={profilePlan} />
        <main className="flex-1 pb-24 max-w-2xl w-full mx-auto px-4 pt-5">
          {children}
        </main>
        <BottomNav />
      </div>
    </SessionTimeoutProvider>
  );
}
