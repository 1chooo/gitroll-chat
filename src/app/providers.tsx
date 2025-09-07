"use client";

import { AuthContextProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";

function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </ThemeProvider>
  );
}

export default Providers;
