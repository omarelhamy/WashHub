const THEME_KEY = 'washhub-theme';
export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function initTheme() {
  document.documentElement.classList.toggle('light', getTheme() === 'light');
}
