"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import EmailVerification from "@/components/auth/email-verification";

export default function DashboardPage() {
  const { user, loading, isEmailVerified } = useAuthGuard("/signin", true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (user && !isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 -mt-20">
        <EmailVerification />
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <div className="text-sm text-center justify-center my-4">
          Welcome back,{" "}
          <span className="font-semibold dark:text-sky-400 text-sky-500">
            {user.email}
          </span>
          !
        </div>
      ) : (
        <div className="text-sm text-center justify-center my-4">
          <Link
            href="/signin"
            className="text-sm underline dark:text-sky-400 text-sky-500 font-semibold"
          >
            Sign in
          </Link>{" "}
          to save focus history and tasks.
        </div>
      )}

      <div className="flex-1 space-y-6 p-6">Hi</div>
    </div>
  );
}
