import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "pt", labelKey: "language.pt" },
  { code: "en", labelKey: "language.en" }
] as const;

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const current = i18n.language;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {t("app.languageLabel")}
      </span>
      <div className="flex gap-2">
        {LANGUAGES.map(({ code, labelKey }) => {
          const active = current.startsWith(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => i18n.changeLanguage(code)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-powder-500 bg-powder-100/90 text-slate-900"
                  : "border-slate-300 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
