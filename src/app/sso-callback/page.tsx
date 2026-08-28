"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { LoadingScreen } from "@/components/loading-screen";

export default function SSOCallbackPage() {
  return (
    <div className="relative min-h-screen w-full">
      <LoadingScreen
        title="Completing Sign In..."
        subtitle="Connecting your Google account and loading your greenhouse environment."
      />
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
      {/* Clerk Smart CAPTCHA target container */}
      <div id="clerk-captcha" />
    </div>
  );
}
