"use client";

import { useAuthContext } from "@/context/auth-context";
import { useEmailVerification } from "@/firebase/auth/email-verification-link";
import { Button } from "@/components/ui/button";
import { Shell } from "lucide-react";

interface EmailVerificationProps {
  isPendingLogin?: boolean;
  isPendingRegistration?: boolean;
}

export default function EmailVerification({ 
  isPendingLogin = false, 
  isPendingRegistration = false 
}: EmailVerificationProps) {
  const { user } = useAuthContext();
  const {
    isEmailVerificationSent,
    isEmailVerificationPending,
    errorVerificationLink,
    sendEmailVerificationLink,
  } = useEmailVerification();

  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerificationLink();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h1 className="text-center text-xl font-bold">Email Verification Required</h1>
      <p>
        Hey{" "}
        <b className="italic underline underline-offset-4">
          {user.email}
        </b>{" "}
        👋
      </p>
      <p className="text-red-600 text-md font-semibold">
        Your email is not verified.
      </p>
      <Button
        disabled={
          isPendingLogin ||
          isPendingRegistration ||
          isEmailVerificationPending
        }
        onClick={handleSendVerificationEmail}
      >
        {isEmailVerificationPending && (
          <Shell className="mr-2 h-4 w-4 animate-spin" />
        )}
        Send verification email
      </Button>
      {isEmailVerificationSent && (
        <p className="text-green-900 text-md font-semibold">
          The email was successfully sent, check your email box to confirm
        </p>
      )}
      {errorVerificationLink && (
        <p className="text-red-900 text-md font-semibold">
          {errorVerificationLink}
        </p>
      )}
    </div>
  );
}
