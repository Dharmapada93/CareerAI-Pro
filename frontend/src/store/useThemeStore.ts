import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  reducedMotion: boolean;
  toggleTheme: () => void;
  toggleReducedMotion: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark", // Default to dark for premium look
  reducedMotion: false,
  toggleTheme: () => {
    const nextTheme = get().theme === "light" ? "dark" : "light";
    set({ theme: nextTheme });
    localStorage.setItem("theme", nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  },
  toggleReducedMotion: () => {
    const nextMotion = !get().reducedMotion;
    set({ reducedMotion: nextMotion });
    localStorage.setItem("reducedMotion", String(nextMotion));
  },
  initTheme: () => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedMotion = localStorage.getItem("reducedMotion") === "true";

    const finalTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    set({ theme: finalTheme, reducedMotion: savedMotion });

    const root = window.document.documentElement;
    if (finalTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  },
}));
