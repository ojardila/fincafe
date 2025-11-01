"use client";

import { useLanguage } from "../contexts/LanguageContext";

export function LanguageSwitcher() {
  const { availableLocales, locale, setLocale, t } = useLanguage();

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-stone-500">
      <span>{t("app.languageLabel")}</span>
      <select
        className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-200"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
      >
        {availableLocales.map((option) => (
          <option key={option} value={option} className="capitalize">
            {option.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
