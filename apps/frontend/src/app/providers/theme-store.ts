import { create } from "zustand";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "finance-os-theme";
export const THEME_COLOR_META = { light: "#6d28d9", dark: "#0b0a13" } as const;

export function getSystemTheme(): Theme {
   if (typeof window === "undefined") return "light";
   return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
   try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
   } catch {
      // Storage may be unavailable in restricted browser environments.
   }
   return null;
}

// The `.dark` class on <html> re-resolves every token through the cascade.
export function applyTheme(theme: Theme) {
   const root = document.documentElement;
   root.classList.toggle("dark", theme === "dark");
   root.dataset.theme = theme;
   root.style.colorScheme = theme;
   const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
   if (meta) meta.content = THEME_COLOR_META[theme];
}

interface ThemeState {
   theme: Theme;
   setTheme: (theme: Theme) => void;
   toggleTheme: () => void;
}

// DOM side effects live in <ThemeSync> so the store stays SSR-safe.
export const useThemeStore = create<ThemeState>()((set, get) => ({
   theme: getStoredTheme() ?? getSystemTheme(),
   setTheme: (theme) => set({ theme }),
   toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
}));
