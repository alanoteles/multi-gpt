import { useState } from "react";
import { fetchModelResponse } from "./lib/modelClients";
import ModelToggle from "./components/ModelToggle";
import ResponseCard from "./components/ResponseCard";
import type { FormEvent } from "react";
import type { ModelKey, ModelOption, ModelResponse } from "./types";

const MODEL_OPTIONS: ModelOption[] = [
  {
    key: "openai",
    label: "OpenAI GPT-4o mini",
    helper: "Respostas equilibradas com bom racioc\u00ednio geral.",
    cardClasses: "from-white/90 via-powder-50 to-powder-100 bg-gradient-to-br",
    badgeClasses: "bg-powder-500 text-slate-900"
  },
  {
    key: "gemini",
    label: "Google Gemini 1.5 Pro",
    helper: "Fortes capacidades multimodal e contextual.",
    cardClasses: "from-white/85 via-powder-100 to-powder-200 bg-gradient-to-br",
    badgeClasses: "bg-powder-400 text-slate-900"
  },
  {
    key: "claude",
    label: "Anthropic Claude 3.5 Sonnet",
    helper: "\u00d3timo para textos longos e an\u00e1lise estruturada.",
    cardClasses: "from-white/80 via-powder-200 to-powder-300 bg-gradient-to-br",
    badgeClasses: "bg-powder-600 text-slate-900"
  }
];

const createInitialResponses = (): Record<ModelKey, ModelResponse> => ({
  openai: { id: "openai", loading: false },
  gemini: { id: "gemini", loading: false },
  claude: { id: "claude", loading: false }
});

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<Record<ModelKey, ModelResponse>>(createInitialResponses);
  const [selectedModels, setSelectedModels] = useState<ModelKey[]>(() => MODEL_OPTIONS.map((opt) => opt.key));
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleModel = (model: ModelKey) => {
    setSelectedModels((current) =>
      current.includes(model) ? current.filter((item) => item !== model) : [...current, model]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    setGlobalError(null);

    if (!trimmed) {
      setGlobalError("Digite um prompt antes de enviar.");
      return;
    }

    if (selectedModels.length === 0) {
      setGlobalError("Selecione ao menos um modelo para comparar.");
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
      await Promise.all(
        selectedModels.map(async (model) => {
          try {
            const text = await fetchModelResponse(model, trimmed);
            setResponses((prev) => ({
              ...prev,
              [model]: { id: model, loading: false, text }
            }));
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Erro desconhecido ao consultar o modelo.";
            setResponses((prev) => ({
              ...prev,
              [model]: { id: model, loading: false, error: message }
            }));
          }
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setPrompt("");
    setResponses(createInitialResponses());
    setGlobalError(null);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="space-y-5 text-center">
        <span className="inline-block rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          multi-gpt
        </span>
        <h1 className="text-4xl font-bold text-slate-900">Comparador de Modelos em Paralelo</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-700">
          Escreva um prompt e compare, com o multi-gpt, como o OpenAI GPT-4o mini, o Google Gemini 1.5 Pro e o Claude 3.5 Sonnet
          respondem lado a lado. Ative apenas os modelos que desejar consultar.
        </p>
      </header>

      <section className="glass-panel mx-auto flex w-full flex-col gap-6 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {MODEL_OPTIONS.map((option) => (
              <ModelToggle
                key={option.key}
                option={option}
                active={selectedModels.includes(option.key)}
                onToggle={toggleModel}
              />
            ))}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              id="prompt"
              placeholder="Descreva a tarefa que você quer comparar..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="h-36 w-full rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-800 outline-none transition focus:border-powder-500 focus:ring-2 focus:ring-powder-500/60"
            />
            {globalError && <p className="text-sm font-medium text-red-600">{globalError}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSubmitting ? "Consultando modelos..." : "Consultar modelos selecionados"}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-slate-900/30 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
            >
              Limpar
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

      <footer className="pb-6 text-center text-xs text-slate-600">
        Para produ\u00e7\u00e3o, use um backend para proteger as chaves das APIs.
      </footer>
    </div>
  );
};

export default App;
