// Auth proxied through Next.js rewrites to avoid cross-origin issues
// /auth-api/* → api.techmadeeasy.info/api/auth/* (same-origin from browser)
// Cookies shared via .techmadeeasy.info domain (Better Auth)

const AUTH_PATH = '/auth-api';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${AUTH_PATH}/get-session`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.user) return null;

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || null,
      image: data.user.image || null,
    };
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${AUTH_PATH}/sign-in/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.message || data.error || 'Sign-in failed' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${AUTH_PATH}/sign-up/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.message || data.error || 'Sign-up failed' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

export async function signInWithGoogle(returnTo: string = '/'): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${AUTH_PATH}/sign-in/social`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: `${window.location.origin}${returnTo}`,
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return {};
    }

    return { error: data.error || data.message || 'Google sign-in failed' };
  } catch (e) {
    return { error: 'Network error — please try again' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch(`${AUTH_PATH}/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best-effort sign-out
  }
}
