import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'theme-storage';

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = theme;
};

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    const persistedTheme = parsed?.state?.theme;
    return persistedTheme === 'dark' || persistedTheme === 'light' ? persistedTheme : null;
  } catch {
    return null;
  }
};

const getInitialTheme = (): Theme => getStoredTheme() ?? getSystemTheme();

interface ThemeState {
  theme: Theme;
  initializeTheme: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      initializeTheme: () => {
        applyTheme(get().theme);
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(nextTheme);
          return { theme: nextTheme };
        }),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
