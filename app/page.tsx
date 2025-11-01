"use client";

import { RoleCard } from "../components/RoleCard";
import { useLanguage } from "../contexts/LanguageContext";
import { roles } from "../data/roles";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-stone-900">{t("app.hero.title")}</h2>
        <p className="text-sm text-stone-600">{t("app.hero.description")}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h3 className="text-lg font-semibold">{t("app.roadmap.title")}</h3>
        <p className="mt-2 text-sm">{t("app.roadmap.description")}</p>
      </section>
    </div>
  );
}
