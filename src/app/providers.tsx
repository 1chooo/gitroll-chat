"use client";

import { AuthContextProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthContextProvider>
        {children}
        <Toaster />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default Providers;
