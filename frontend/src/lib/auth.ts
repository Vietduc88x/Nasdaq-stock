// Shared auth with AI Energy Analyst via api.techmadeeasy.info
// Better Auth cookies are set with domain=.techmadeeasy.info (shared across subdomains)

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://api.techmadeeasy.info';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${AUTH_API}/api/auth/get-session`, {
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
    const res = await fetch(`${AUTH_API}/api/auth/sign-in/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.message || 'Sign-in failed' };
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
    const res = await fetch(`${AUTH_API}/api/auth/sign-up/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.message || 'Sign-up failed' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

export async function signInWithGoogle(returnTo: string = '/'): Promise<void> {
  try {
    const res = await fetch(`${AUTH_API}/api/auth/sign-in/social`, {
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
    }
  } catch {
    // Silently fail — user stays on sign-in page
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch(`${AUTH_API}/api/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best-effort sign-out
  }
}
