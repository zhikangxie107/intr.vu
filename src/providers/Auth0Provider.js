"use client";
import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0ProviderWrapper({ children }) {
  return (
    <Auth0Provider
      domain="dev-m4jpwbqs0dece0uk.us.auth0.com"
      clientId="0ckrVTfqQWP8IWeI1fHfyAxTPEtxjRRx"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
      cacheLocation="localstorage"       
      useRefreshTokens={true} 
    >
      {children}
    </Auth0Provider>
  );
}
