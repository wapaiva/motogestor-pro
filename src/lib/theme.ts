export type ThemeMode = "light" | "dark" | "auto";

let mediaQuery: MediaQueryList | null = null;
let listener: ((e: MediaQueryListEvent) => void) | null = null;

export function getThemeMode(): ThemeMode {
  return (localStorage.getItem("mg_theme") as ThemeMode) || "auto";
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem("mg_theme", mode);
  applyTheme(mode);
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mediaQuery && listener) {
    mediaQuery.removeEventListener("change", listener);
  }

  if (mode === "auto") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
    };
    apply(mediaQuery.matches);
    listener = (e: MediaQueryListEvent) => apply(e.matches);
    mediaQuery.addEventListener("change", listener);
  } else if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
