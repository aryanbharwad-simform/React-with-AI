import { useEffect, useState, type ReactNode } from "react";
import type { LoginValues } from "@/schemas/auth";
import {
  SESSION_EXPIRED_MESSAGE,
  setUnauthorizedHandler,
} from "@/services/apiClient";
import * as authService from "@/services/authService";
import {
  clearSession,
  isTokenExpired,
  readSession,
  saveSession,
  type Session,
} from "@/services/session";
import { AuthContext, type AuthContextValue } from "./authContext";

interface AuthState {
  session: Session | null;
  notice: string | null;
}

/** Runs once, on first render: restore the session from storage (this is how refresh keeps you logged in). */
function getInitialState(): AuthState {
  const session = readSession();
  if (session && isTokenExpired(session.token)) {
    clearSession();
    return { session: null, notice: SESSION_EXPIRED_MESSAGE };
  }
  return { session, notice: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initial state: React calls getInitialState only on the first render, not on every render.
  const [state, setState] = useState<AuthState>(getInitialState);

  // When any API call gets a 401, log out and explain why. The cleanup removes the handler
  // when the provider unmounts, so it never calls setState on a component that is gone.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setState({ session: null, notice: SESSION_EXPIRED_MESSAGE });
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(credentials: LoginValues) {
    // `credentials` (with the password) only lives in this function call. We keep the token + user.
    const { accessToken, user } = await authService.login(credentials);
    const session: Session = { token: accessToken, user };
    saveSession(session);
    setState({ session, notice: null });
  }

  function logout(notice?: string) {
    clearSession();
    setState({ session: null, notice: notice ?? null });
  }

  const user = state.session?.user ?? null;
  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === "admin",
    notice: state.notice,
    login,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
