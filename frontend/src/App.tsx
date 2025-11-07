import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitPrompt } from "./lib/apiClient";
import ModelToggle from "./components/ModelToggle";
import ResponseCard from "./components/ResponseCard";
import LanguageSwitcher from "./components/LanguageSwitcher";
import type { FormEvent } from "react";
import type { ModelKey, ModelOption, ModelResponse } from "./types";

const MODEL_OPTIONS: ModelOption[] = [
  {
    key: "openai",
    labelKey: "models.openai.label",
    helperKey: "models.openai.helper",
    cardClasses: "from-white/90 via-powder-50 to-powder-100 bg-gradient-to-br",
    badgeClasses: "bg-powder-500 text-slate-900"
  },
  {
    key: "gemini",
    labelKey: "models.gemini.label",
    helperKey: "models.gemini.helper",
    cardClasses: "from-white/85 via-powder-100 to-powder-200 bg-gradient-to-br",
    badgeClasses: "bg-powder-400 text-slate-900"
  },
  {
    key: "claude",
    labelKey: "models.claude.label",
    helperKey: "models.claude.helper",
    cardClasses: "from-white/80 via-powder-200 to-powder-300 bg-gradient-to-br",
    badgeClasses: "bg-powder-600 text-slate-900"
  }
];

const createInitialResponses = (): Record<ModelKey, ModelResponse> => ({
  openai: { id: "openai", loading: false },
  gemini: { id: "gemini", loading: false },
  claude: { id: "claude", loading: false }
});

type GlobalErrorKey = "promptRequired" | "modelRequired" | null;

const App = () => {
  const { t, i18n } = useTranslation();
  const tokenFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language?.startsWith("en") ? "en-US" : "pt-BR"),
    [i18n.language]
  );
  const formatTokens = (value?: number) =>
    typeof value === "number" ? tokenFormatter.format(value) : null;

  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<Record<ModelKey, ModelResponse>>(createInitialResponses);
  const [selectedModels, setSelectedModels] = useState<ModelKey[]>(() => MODEL_OPTIONS.map((opt) => opt.key));
  const [globalErrorKey, setGlobalErrorKey] = useState<GlobalErrorKey>(null);
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tokensLabel = t("tokens.label");
  const tokensLoading = t("tokens.loading");

  const toggleModel = (model: ModelKey) => {
    setSelectedModels((current) =>
      current.includes(model) ? current.filter((item) => item !== model) : [...current, model]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    setGlobalErrorKey(null);
    setGlobalErrorMessage(null);

    if (!trimmed) {
      setGlobalErrorKey("promptRequired");
      setGlobalErrorMessage(null);
      return;
    }

    if (selectedModels.length === 0) {
      setGlobalErrorKey("modelRequired");
      setGlobalErrorMessage(null);
      return;
    }

    setResponses((prev) => {
      const next = { ...prev };
      selectedModels.forEach((model) => {
        next[model] = { id: model, loading: true };
      });
      return next;
    });

    setIsSubmitting(true);

    try {
      const data = await submitPrompt({ prompt: trimmed, models: selectedModels });
      setResponses((prev) => {
        const next = { ...prev };
        selectedModels.forEach((model) => {
          const result = data.results.find((item) => item.id === model);
          next[model] = {
            id: model,
            loading: false,
            text: result?.text,
            error: result?.error ?? (result ? undefined : t("errors.unknownModelError")),
            tokensUsed: result?.tokensUsed,
            tokensRemaining: result?.tokensRemaining
          };
        });
        return next;
      });
      setGlobalErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.unknownModelError");
      setGlobalErrorMessage(message);
      setResponses((prev) => {
        const next = { ...prev };
        selectedModels.forEach((model) => {
          next[model] = { id: model, loading: false, error: message };
        });
        return next;
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setPrompt("");
    setResponses(createInitialResponses());
    setGlobalErrorKey(null);
    setGlobalErrorMessage(null);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="space-y-5 text-center">
        <span className="inline-block rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          {t("app.badge")}
        </span>
        <h1 className="text-4xl font-bold text-slate-900">{t("app.title")}</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-700">{t("app.description")}</p>
        <LanguageSwitcher />
      </header>

      <section className="glass-panel mx-auto flex w-full flex-col gap-6 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {MODEL_OPTIONS.map((option) => {
              const response = responses[option.key];
              const usedDisplay =
                response.loading || response.tokensUsed === undefined
                  ? response.loading
                    ? tokensLoading
                    : "—"
                  : formatTokens(response.tokensUsed);
              const hasRemaining = !response.loading && typeof response.tokensRemaining === "number";
              const remainingDisplay = hasRemaining ? formatTokens(response.tokensRemaining) : null;

              return (
                <div key={option.key} className="space-y-2">
                  <ModelToggle
                    option={option}
                    active={selectedModels.includes(option.key)}
                    onToggle={toggleModel}
                  />
                  <p className="text-xs text-slate-600">
                    {tokensLabel}{" "}
                    <span className="font-semibold text-red-600">{usedDisplay}</span>
                    {remainingDisplay && (
                      <>
                        <span className="text-slate-400">/</span>
                        <span className="font-semibold text-blue-600">{remainingDisplay}</span>
                      </>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="prompt">
              {t("app.promptLabel")}
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                placeholder={t("app.promptPlaceholder")}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={800}
                className="h-36 w-full rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-800 outline-none transition focus:border-powder-500 focus:ring-2 focus:ring-powder-500/60"
              />
              <span className="absolute bottom-2 right-4 text-xs text-slate-500">
                {prompt.length}/800
              </span>
            </div>
            {globalErrorKey && (
              <p className="text-sm font-medium text-red-600">{t(`errors.${globalErrorKey}`)}</p>
            )}
            {!globalErrorKey && globalErrorMessage && (
              <p className="text-sm font-medium text-red-600">{globalErrorMessage}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSubmitting ? t("app.submitLoading") : t("app.submit")}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-slate-900/30 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
            >
              {t("app.reset")}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MODEL_OPTIONS.map((option) => (
          <ResponseCard
            key={option.key}
            option={option}
            response={responses[option.key]}
            active={selectedModels.includes(option.key)}
          />
        ))}
      </section>

      <footer className="pb-6 text-center text-xs text-slate-600">{t("footer.disclaimer")}</footer>
    </div>
  );
};

export default App;
