import { useThemeStore, type Theme } from "./theme-store";

export interface UseThemeReturn {
   theme: Theme;
   setTheme: (theme: Theme) => void;
   toggleTheme: () => void;
}

// Individual selectors keep consumers from re-rendering on unrelated state.
export function useTheme(): UseThemeReturn {
   const theme = useThemeStore((s) => s.theme);
   const setTheme = useThemeStore((s) => s.setTheme);
   const toggleTheme = useThemeStore((s) => s.toggleTheme);
   return { theme, setTheme, toggleTheme };
}
