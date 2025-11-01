"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";

export function AppHeader() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-600">{t("app.name")}</p>
          <h1 className="text-lg font-semibold text-stone-900">{t("app.tagline")}</h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-stone-500">
          <nav aria-label={t("app.navigation.home")}>
            <span>{t("app.navigation.home")}</span>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
