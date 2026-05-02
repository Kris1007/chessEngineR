export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

const AUTH_USER_KEY = "authUser";

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function loginWithGoogleCredential(credential: string) {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    throw new Error("Google sign-in failed.");
  }

  const data = (await response.json()) as { user: AuthUser };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  return data.user;
}
