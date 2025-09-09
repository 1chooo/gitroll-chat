"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthContext } from "@/context/auth-context";
import { useGoogleLogin } from "@/firebase/auth/google-login";
import { useEmailPasswordLogin } from "@/firebase/auth/email-password-login";
import { useEmailPasswordRegistration } from "@/firebase/auth/email-password-registration";
import { useEmailVerification } from "@/firebase/auth/email-verification-link";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function Home() {
  const { user } = useAuthContext();
  const router = useRouter();

  const { googleLogin, isPendingGoogleLogin } = useGoogleLogin();
  const {
    emailPasswordLogin,
    errorEmailPasswordLogin,
    isPendingEmailPasswordLogin,
  } = useEmailPasswordLogin();
  const { errorEmailPasswordRegistration, isPendingEmailPasswordRegistration } =
    useEmailPasswordRegistration();
  const {
    isEmailVerificationSent,
    isEmailVerificationPending,
    errorVerificationLink,
    sendEmailVerificationLink,
  } = useEmailVerification();

  const formEmailPassword = useForm<z.infer<typeof FormSchemaEmailPassword>>({
    resolver: zodResolver(FormSchemaEmailPassword),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user?.emailVerified) {
      router.push(`/chat`);
    }
  }, [user, router]);

  async function onSubmitEmailPasswordLogin(
    data: z.infer<typeof FormSchemaEmailPassword>,
  ) {
    await emailPasswordLogin(data.email, data.password);
  }

  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerificationLink();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 -mt-16">
      <div className="w-full max-w-md space-y-8">
        {user ? (
          <div className="w-full flex flex-col items-center gap-4">
            <h1 className="text-center text-xl font-bold">Connected !</h1>
            <p>
              Hey{" "}
              <b className="italic underline underline-offset-4">
                {user.email}
              </b>{" "}
              👋
            </p>
            {user.emailVerified ? (
              <p className="text-green-900 text-md font-semibold">
                Your email is verified. Redirecting to dashboard...
              </p>
            ) : (
              <>
                <p className="text-red-600 text-md font-semibold">
                  Your email is not verified.
                </p>
                <Button
                  disabled={
                    isPendingEmailPasswordLogin ||
                    isPendingEmailPasswordRegistration ||
                    isEmailVerificationPending
                  }
                  onClick={handleSendVerificationEmail}
                >
                  {isEmailVerificationPending && (
                    <Shell className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send verification email
                </Button>
              </>
            )}
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
        ) : (
          <div className="w-full">
            <Card className="shadow-xl bg-neutral-100 dark:bg-neutral-800">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>
                  Login to your GitRoll Chat account
                </CardDescription>
              </CardHeader>

              <CardContent className=" px-6 pb-6 space-y-6">
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
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormField
                        control={formEmailPassword.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                id="password"
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
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={
                          isPendingGoogleLogin ||
                          isPendingEmailPasswordLogin ||
                          isPendingEmailPasswordRegistration ||
                          isEmailVerificationPending
                        }
                        onClick={formEmailPassword.handleSubmit(
                          onSubmitEmailPasswordLogin,
                        )}
                      >
                        {isPendingEmailPasswordLogin && (
                          <Shell className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign in
                      </Button>
                    </div>
                    {(errorEmailPasswordLogin ||
                      errorEmailPasswordRegistration) && (
                        <span className="text-red-500 text-center text-sm block mt-4 font-semibold">
                          {errorEmailPasswordLogin && (() => {
                            switch (errorEmailPasswordLogin) {
                              case "auth/invalid-login-credentials":
                              case "auth/invalid-credential":
                                return "Invalid email or password";
                              case "auth/user-not-found":
                                return "No account found with this email address";
                              case "auth/wrong-password":
                                return "Incorrect password";
                              case "auth/invalid-email":
                                return "Invalid email format";
                              case "auth/user-disabled":
                                return "This account has been disabled";
                              case "auth/too-many-requests":
                                return "Too many failed attempts. Please try again later";
                              default:
                                return `Login failed: ${errorEmailPasswordLogin}`;
                            }
                          })()}
                          {errorEmailPasswordRegistration === "auth/email-already-in-use" && 
                            "This user already exists"}
                        </span>
                      )}
                  </form>
                </Form>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary ">
              By clicking continue, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
