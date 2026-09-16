'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, magicLinkSchema, registerSchema } from '@/lib/validation/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rateLimit';

// State types must be exported so pages can use them with useActionState<S, F>.
export type AuthActionState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string };

export type MagicLinkActionState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string }
  | { success: true; message: string };

// ---------------------------------------------------------------------------
// loginTailorWithPassword (Tailors Only)
// ---------------------------------------------------------------------------
export async function loginTailorWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailRaw = String(formData.get('email') || '').trim().toLowerCase();

  // Rate limit check: max 6 attempts per 15 mins per email
  const rateLimitKey = `login_tailor_${emailRaw}`;
  const rateLimit = checkRateLimit(rateLimitKey, 6, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      error: `Too many failed login attempts. Please try again in ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} minutes.`,
    };
  }

  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[Tailor Auth] signInWithPassword error:', error.message);
    return { error: 'Invalid email or password.' };
  }

  const userId = signInData.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', userId)
      .single();

    // Strict Role Isolation: Tailor login must NEVER recognize or permit admin accounts
    if (profile?.role !== 'tailor') {
      await supabase.auth.signOut();
      return { error: 'Invalid email or password.' };
    }

    if (profile?.status === 'suspended') {
      await supabase.auth.signOut();
      return { error: 'Your account is suspended. Please contact support.' };
    }
  }

  // Reset rate limit on successful authentication
  resetRateLimit(rateLimitKey);

  redirect('/dashboard');
}

// ---------------------------------------------------------------------------
// loginAdminWithPassword (Admins Only)
// ---------------------------------------------------------------------------
export async function loginAdminWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailRaw = String(formData.get('email') || '').trim().toLowerCase();

  // Strict rate limit check for admin: max 5 attempts per 15 mins
  const rateLimitKey = `login_admin_${emailRaw}`;
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      error: `Too many failed attempts. Access temporarily restricted. Try again in ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} minutes.`,
    };
  }

  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error('[Admin Auth] signInWithPassword error:', error.message);
    return { error: 'Invalid credentials or unauthorized access.' };
  }

  const userId = signInData.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', userId)
      .single();

    // Strict Role Isolation: Admin login must NEVER recognize or permit tailor accounts
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: 'Invalid credentials or unauthorized access.' };
    }

    if (profile?.status === 'suspended') {
      await supabase.auth.signOut();
      return { error: 'This administrator account is disabled.' };
    }
  }

  // Reset rate limit on successful authentication
  resetRateLimit(rateLimitKey);

  redirect('/admin');
}

// Backward-compatibility alias
export const loginWithPassword = loginTailorWithPassword;

// ---------------------------------------------------------------------------
// loginWithMagicLink
// ---------------------------------------------------------------------------
export async function loginWithMagicLink(
  _prevState: MagicLinkActionState,
  formData: FormData
): Promise<MagicLinkActionState> {
  const supabase = await createClient();

  const parsed = magicLinkSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    },
  });

  if (error) {
    return { error: 'Failed to send magic link. Please try again.' };
  }

  return { success: true, message: 'Check your email for a login link.' };
}

// ---------------------------------------------------------------------------
// registerTailor
// ---------------------------------------------------------------------------
export async function registerTailor(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
      },
    },
  });

  if (error) {
    console.error('[Supabase Auth] signUp error:', error.message);
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with that email already exists.' };
    }
    return { error: `Registration failed: ${error.message}` };
  }

  redirect('/dashboard');
}

// ---------------------------------------------------------------------------
// logout (Tailor)
// ---------------------------------------------------------------------------
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ---------------------------------------------------------------------------
// logoutAdmin (Admin)
// ---------------------------------------------------------------------------
export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin-login');
}
