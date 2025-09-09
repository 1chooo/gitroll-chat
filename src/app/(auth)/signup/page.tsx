"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuthContext } from "@/context/auth-context";
import { useEmailPasswordLogin } from "@/firebase/auth/email-password-login";
import { useEmailPasswordRegistration } from "@/firebase/auth/email-password-registration";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EmailVerification from "@/components/auth/email-verification";

import { Shell } from "lucide-react";

const FormSchemaEmailPassword = z.object({
  email: z
    .string({
      message: "Email is required.",
    })
    .email({
      message: "Please enter a valid email.",
    }),
  password: z
    .string({
      message: "Password is required.",
    })
    .min(8, {
      message: "Password must be at least 8 characters.",
    }),
});

export default function SignUpPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const { isPendingEmailPasswordLogin } = useEmailPasswordLogin();
  const {
    emailPasswordRegistration,
    errorEmailPasswordRegistration,
    isPendingEmailPasswordRegistration,
  } = useEmailPasswordRegistration();


  const formEmailPassword = useForm<z.infer<typeof FormSchemaEmailPassword>>({
    resolver: zodResolver(FormSchemaEmailPassword),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push(`/chat`);
    }
  }, [user, router]);

  async function onSubmitEmailPasswordRegistration(
    data: z.infer<typeof FormSchemaEmailPassword>,
  ) {
    await emailPasswordRegistration(data.email, data.password);
  }



  return (
    <div className="min-h-screen flex items-center justify-center p-4 -mt-20">
      <div className="w-full max-w-md space-y-8">
        {user ? (
          user.emailVerified ? (
            <div className="w-full flex flex-col items-center gap-4">
              <h1 className="text-center text-xl font-bold">Connected !</h1>
              <p>
                Hey{" "}
                <b className="italic underline underline-offset-4">
                  {user.email}
                </b>{" "}
                👋
              </p>
              <p className="text-green-900 text-md font-semibold">
                Your email is verified. Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <EmailVerification 
              isPendingLogin={isPendingEmailPasswordLogin}
              isPendingRegistration={isPendingEmailPasswordRegistration}
            />
          )
        ) : (
          <Card className="shadow-xl bg-neutral-100 dark:bg-neutral-800">
            <CardContent className="pt-8 px-6 pb-6 space-y-6">
              <h1 className="text-3xl font-semibold  mb-8">Get Started</h1>

              <Form {...formEmailPassword}>
                <form className="w-full space-y-6">
                  <FormField
                    control={formEmailPassword.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            required
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formEmailPassword.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="************"
                            required
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full h-12 font-medium"
                    type="button"
                    disabled={
                      isPendingEmailPasswordLogin ||
                      isPendingEmailPasswordRegistration
                    }
                    onClick={formEmailPassword.handleSubmit(
                      onSubmitEmailPasswordRegistration,
                    )}
                  >
                    {isPendingEmailPasswordRegistration && (
                      <Shell className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign Up
                  </Button>
                  {errorEmailPasswordRegistration && (
                    <span className="text-red-500 text-center text-sm block mt-4 font-semibold">
                      {errorEmailPasswordRegistration ===
                        "auth/email-already-in-use" &&
                        "This user already exists "}
                    </span>
                  )}
                </form>
              </Form>

              <p className="text-center text-gray-400">
                Have an account?{" "}
                <Link href="/signin" className="transition-colors underline">
                  Sign in now
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
