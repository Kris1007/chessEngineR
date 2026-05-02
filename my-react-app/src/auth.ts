export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

const AUTH_USER_KEY = "authUser";
const AUTH_TOKEN_KEY = "authToken";

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

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
  localStorage.removeItem(AUTH_TOKEN_KEY);
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

  const data = (await response.json()) as { user: AuthUser; token: string };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data.user;
}

export async function loginWithEmail(payload: any) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed.");
  }

  const data = (await response.json()) as { user: AuthUser; token: string };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data.user;
}

export async function signupWithEmail(payload: any) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed.");
  }

  const data = (await response.json()) as { user: AuthUser; token: string };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data.user;
}
