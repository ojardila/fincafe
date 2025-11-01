"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { availableLocales, type Locale, translations } from "../lib/translations";

type TranslationValue = string;

type TranslationNode = Record<string, TranslationNode | TranslationValue>;

interface LanguageContextValue {
  locale: Locale;
  availableLocales: readonly Locale[];
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const defaultLocale: Locale = "en";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getNestedValue = (node: TranslationNode | TranslationValue, path: string[]): TranslationValue | undefined => {
  if (!path.length) {
    return typeof node === "string" ? node : undefined;
  }

  if (typeof node === "string") {
    return undefined;
  }

  const [current, ...rest] = path;
  const next = node[current];

  if (next === undefined) {
    return undefined;
  }

  return getNestedValue(next, rest);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = translations[locale];

    const translate = (path: string) => {
      const segments = path.split(".");
      const result = getNestedValue(dictionary, segments);

      if (result) {
        return result;
      }

      // fallback to English when key is missing in the selected locale
      const fallback = getNestedValue(translations.en, segments);

      return fallback ?? path;
    };

    return {
      locale,
      availableLocales,
      setLocale,
      t: translate,
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
