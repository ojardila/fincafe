"use client";

import { useLanguage } from "../contexts/LanguageContext";
import type { RoleDefinition } from "../data/roles";

interface RoleCardProps {
  role: RoleDefinition;
}

export function RoleCard({ role }: RoleCardProps) {
  const { t } = useLanguage();
  const title = t(`${role.translationKey}.title`);
  const summary = t(`${role.translationKey}.summary`);
  const responsibilities = role.responsibilityKeys.map((key) => t(key));

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <header className="mb-4">
        <span className="text-xs uppercase tracking-wider text-amber-600">
          {t("app.roleLabel")}: {role.id}
        </span>
        <h2 className="mt-2 text-xl font-semibold text-stone-900">{title}</h2>
        <p className="mt-1 text-sm text-stone-600">{summary}</p>
      </header>
      <section>
        <h3 className="text-sm font-semibold text-stone-800">{t("app.roleSectionTitle")}</h3>
        <ul className="mt-2 space-y-1 text-sm text-stone-600">
          {responsibilities.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
