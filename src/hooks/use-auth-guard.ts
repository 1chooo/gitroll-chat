"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";

export const useAuthGuard = (
  redirectTo: string = "/signin",
  requireEmailVerification: boolean = false,
) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requireEmailVerification && !user.emailVerified) {
        router.push("/signup");
      }
    }
  }, [user, loading, router, redirectTo, requireEmailVerification]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
  };
};
