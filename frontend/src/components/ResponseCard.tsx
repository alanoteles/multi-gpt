import type { ModelOption, ModelResponse } from "../types";

type Props = {
  option: ModelOption;
  response: ModelResponse;
  active: boolean;
};

const ResponseCard = ({ option, response, active }: Props) => {
  const status = response.loading
    ? "Gerando resposta..."
    : response.error
    ? response.error
    : response.text;

  return (
    <article
      className={`glass-panel flex h-full flex-col gap-4 rounded-2xl p-6 transition ${
        active ? "border-powder-500/60" : "border-transparent opacity-75"
      } ${option.cardClasses}`}
    >
      <header className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{option.label}</h3>
          <p className="text-xs text-slate-600">{option.helper}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${option.badgeClasses}`}
        >
          {option.key}
        </span>
      </header>

      <div className="flex-1 rounded-xl bg-white/60 p-4 text-sm leading-relaxed text-slate-800">
        {response.loading && (
          <div className="flex items-center gap-3 text-slate-600">
            <span className="h-2 w-2 animate-ping rounded-full bg-powder-500" />
            Gerando resposta...
          </div>
        )}

        {!response.loading && response.error && (
          <p className="text-sm font-medium text-red-600">{response.error}</p>
        )}

        {!response.loading && !response.error && status && (
          <pre className="whitespace-pre-wrap font-sans">{status}</pre>
        )}

        {!response.loading && !active && !status && (
          <p className="text-sm text-slate-500">
            Modelo n\u00e3o selecionado para esta consulta.
          </p>
        )}
      </div>
    </article>
  );
};

export default ResponseCard;
