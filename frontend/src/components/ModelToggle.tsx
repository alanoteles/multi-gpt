import { useTranslation } from "react-i18next";

import type { ModelKey, ModelOption } from "../types";

type Props = {
  option: ModelOption;
  active: boolean;
  onToggle: (model: ModelKey) => void;
};

const ModelToggle = ({ option, active, onToggle }: Props) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(option.key)}
      className={`glass-panel flex w-full flex-col gap-1 rounded-xl px-4 py-3 text-left transition ${
        active
          ? "bg-powder-100/90 border-powder-500/70 ring-2 ring-offset-2 ring-offset-white ring-powder-500"
          : "bg-white/60 opacity-80 hover:bg-white/75 hover:opacity-100"
      }`}
    >
      <span className="text-sm font-semibold text-slate-900">{t(option.labelKey)}</span>
      <span className="text-xs text-slate-600">{t(option.helperKey)}</span>
      <span className={`self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${option.badgeClasses}`}>
        {option.key}
      </span>
    </button>
  );
};

export default ModelToggle;
