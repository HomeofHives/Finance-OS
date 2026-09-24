import type { ReactNode } from "react";
import { SmoothScroll } from "../../shared/ui/SmoothScroll";
import { ThemeSync } from "./theme-sync";

interface AppProvidersProps {
   children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
   return (
      <>
         <ThemeSync />
         <SmoothScroll />
         {children}
      </>
   );
}
