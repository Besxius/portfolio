"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Language, translations } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type AppContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  colorTheme: 'blue' | 'green';
  setColorTheme: (color: 'blue' | 'green') => void;
  t: typeof translations['en'];
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  const [language, setLanguage] = React.useState<Language>('en');
  const [colorTheme, setColorTheme] = React.useState<'blue' | 'green'>('blue');
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const savedLang = localStorage.getItem('portfolio-language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
      setLanguage(savedLang);
    }
    const savedColor = localStorage.getItem('portfolio-color') as 'blue' | 'green';
    if (savedColor && (savedColor === 'blue' || savedColor === 'green')) {
      setColorTheme(savedColor);
    }
    
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-color-theme', colorTheme);
      localStorage.setItem('portfolio-color', colorTheme);
    }
  }, [colorTheme]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-language', language);
    }
  }, [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    colorTheme,
    setColorTheme,
    t: translations[language] || translations['en'],
    isAdmin,
    setIsAdmin
  }), [language, colorTheme, isAdmin]);

  return (
    <NextThemesProvider {...props}>
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    </NextThemesProvider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProviders");
  }
  return context;
}
