import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import '../styles/light.css';
import '../styles/dark.css';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // FIX: setTheme ahora es estable (useCallback) en vez de pasar el
  // setState crudo directo al value (que de por sí ya era estable, pero
  // se deja explícito y consistente con toggleTheme).
  const setTheme = useCallback((nuevoTheme) => {
    setThemeState(nuevoTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // FIX: value memoizado, mismo motivo que en AuthContext/NotificacionesContext:
  // evita recrear el objeto (y forzar re-render de todo lo que use useTheme())
  // en renders donde theme no cambió.
  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  // El tema se aplica como clase en un wrapper propio (display: contents,
  // no altera el layout) en vez de en document.body. Así queda scopeado
  // solo al subárbol donde se monta ThemeProvider (MainLayout /
  // EmployeeLayout) y páginas fuera de ese árbol (como Login) nunca lo heredan.
  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme}`} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe utilizarse dentro de ThemeProvider');
  }

  return context;
}
