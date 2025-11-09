"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

/**
 * Ensures Auth0 has fully loaded before redirecting.
 * Redirects only if user is *confirmed unauthenticated*.
 */
export function useCheckAuth({ redirectTo = "/", autoLogin = false } = {}) {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Do nothing while loading or until Auth0 initializes
    if (isLoading) return;

    // Once loaded, check authentication state
    if (!isAuthenticated) {
      if (autoLogin) {
        loginWithRedirect();
      } else {
        window.location.replace(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, redirectTo, autoLogin, loginWithRedirect]);

  return { user, isAuthenticated, isLoading };
}
