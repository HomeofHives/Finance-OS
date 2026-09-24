import { useEffect } from "react";
import { applyTheme, THEME_STORAGE_KEY, useThemeStore } from "./theme-store";

// DOM/persistence side effects live here so the store stays SSR-safe.
export function ThemeSync() {
   const theme = useThemeStore((s) => s.theme);

   useEffect(() => {
      applyTheme(theme);
      try {
         localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
         // Quota/private-mode writes must not crash the app.
      }
   }, [theme]);

   return null;
}
