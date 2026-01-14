import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("lexify-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("lexify-theme", theme);
    set({ theme });
  },
}));