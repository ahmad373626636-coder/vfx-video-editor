import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ChromaKeySettings } from "../utils/chromaKey";

interface ChromaKeyPanelProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  settings: ChromaKeySettings;
  onChange: (s: ChromaKeySettings) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  color: string;
  ocid: string;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min = 0,
  max = 255,
  color,
  ocid,
  onChange,
}: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-mono w-8 shrink-0 font-semibold"
        style={{ color }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        data-ocid={ocid}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
        style={
          {
            "--range-color": color,
            accentColor: color,
          } as React.CSSProperties
        }
      />
      <span className="text-xs font-mono w-8 text-right text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

export default function ChromaKeyPanel({
  enabled,
  onToggle,
  settings,
  onChange,
}: ChromaKeyPanelProps) {
  return (
    <div className="space-y-4">
      {/* Header toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Chroma Key
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Remove green screen background
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          data-ocid="chromakey.toggle"
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {enabled && (
        <div className="space-y-3 pt-1">
          {/* Key color preview */}
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Key Color</Label>
            <div
              className="w-8 h-8 rounded-lg border border-border"
              style={{
                background: `rgb(${settings.red}, ${settings.green}, ${settings.blue})`,
              }}
            />
            <span className="text-xs font-mono text-muted-foreground">
              rgb({settings.red}, {settings.green}, {settings.blue})
            </span>
          </div>

          <SliderRow
            label="R"
            value={settings.red}
            color="#ff4444"
            ocid="chromakey.red_input"
            onChange={(v) => onChange({ ...settings, red: v })}
          />
          <SliderRow
            label="G"
            value={settings.green}
            color="#44ff44"
            ocid="chromakey.green_input"
            onChange={(v) => onChange({ ...settings, green: v })}
          />
          <SliderRow
            label="B"
            value={settings.blue}
            color="#4488ff"
            ocid="chromakey.blue_input"
            onChange={(v) => onChange({ ...settings, blue: v })}
          />
          <SliderRow
            label="±"
            value={settings.threshold}
            max={200}
            color="#aaaaaa"
            ocid="chromakey.threshold_input"
            onChange={(v) => onChange({ ...settings, threshold: v })}
          />
        </div>
      )}
    </div>
  );
}
