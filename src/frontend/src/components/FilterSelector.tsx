import { motion } from "motion/react";
import {
  VFX_FILTERS,
  VFX_FILTER_COLORS,
  VFX_FILTER_LABELS,
} from "../utils/chromaKey";

const FILTERS = Object.keys(VFX_FILTER_LABELS);

interface FilterSelectorProps {
  active: string;
  onChange: (filter: string) => void;
}

const FILTER_ICONS: Record<string, string> = {
  normal: "◯",
  cinematic: "🎬",
  vintage: "📷",
  neon: "⚡",
  bw: "◐",
  glitch: "⚙",
};

export default function FilterSelector({
  active,
  onChange,
}: FilterSelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex gap-3 px-1 min-w-max">
        {FILTERS.map((f, i) => {
          const isActive = active === f;
          const color = VFX_FILTER_COLORS[f];
          return (
            <motion.button
              key={f}
              data-ocid={`filter.item.${i + 1}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(f)}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] py-2 px-2 rounded-xl border transition-all
                ${
                  isActive
                    ? "border-[var(--active-color)] bg-[var(--active-color)]/10"
                    : "border-border bg-surface-1 hover:border-border/60"
                }`}
              style={{ "--active-color": color } as React.CSSProperties}
            >
              {/* Filter preview swatch */}
              <div
                className="w-12 h-9 rounded-lg overflow-hidden flex items-center justify-center text-xl relative"
                style={{
                  background:
                    "linear-gradient(135deg, #1a3a4a 0%, #2d1a3a 100%)",
                  filter: VFX_FILTERS[f] || "none",
                }}
              >
                <span style={{ filter: "none", fontSize: "18px" }}>
                  {FILTER_ICONS[f]}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold tracking-wide uppercase font-mono"
                style={{ color: isActive ? color : undefined }}
              >
                {VFX_FILTER_LABELS[f]}
              </span>
              {isActive && (
                <motion.div
                  layoutId="filter-indicator"
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
