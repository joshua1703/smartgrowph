"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignInPanel() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const clerk = useClerk();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, automatically redirect to dashboard
  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  const handleGoogleAuth = async () => {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      setErrorMessage("An internet connection is required to sign in with Google.");
      return;
    }

    if (!isAuthLoaded || !clerk.loaded || !clerk.client) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      // Fallback: If user needs signup
      if (clerk.client.signUp) {
        try {
          await clerk.client.signUp.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/dashboard",
          });
          return;
        } catch (signupErr: unknown) {
          console.error("Clerk signup fallback error:", signupErr);
        }
      }

      console.error("Clerk Google OAuth sign-in error:", err);
      setErrorMessage("Unable to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Sign in with Google to access your greenhouse dashboard and live automation controls.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive animate-in fade-in-50 duration-200"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Authentication Error</p>
            <p className="text-[11px] leading-normal opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Google Sign-In Action */}
      <div className="space-y-4 pt-1">
        <Button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading || !isAuthLoaded || !clerk.loaded}
          className="relative flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border/80 bg-muted/40 hover:bg-muted text-foreground font-semibold text-sm shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleLogo className="size-4.5" />
              <span>Continue with Google</span>
            </>
          )}
        </Button>
      </div>

      {/* Legal & Onboarding Notes */}
      <div className="space-y-3 pt-2 text-xs text-muted-foreground leading-relaxed">
        <p>
          By continuing you agree to our{" "}
          <Link href="/terms" className="font-semibold text-foreground hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-foreground hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p>
          New here? Continuing with Google creates your account automatically.
        </p>
      </div>

      {/* Clerk Smart CAPTCHA target container */}
      <div id="clerk-captcha" />
    </div>
  );
}
