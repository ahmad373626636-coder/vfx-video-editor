import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, PaletteIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";

interface BackgroundPanelProps {
  backgroundColor: string;
  backgroundImage: string | null;
  onColorChange: (color: string) => void;
  onImageChange: (url: string | null) => void;
}

export default function BackgroundPanel({
  backgroundColor,
  backgroundImage,
  onColorChange,
  onImageChange,
}: BackgroundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(url);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          Background
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Replace removed background
        </p>
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-3">
        <PaletteIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Label className="text-xs text-muted-foreground">Solid Color</Label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => onColorChange(e.target.value)}
          data-ocid="background.color_input"
          className="cursor-pointer"
          title="Pick background color"
        />
        <span className="text-xs font-mono text-muted-foreground">
          {backgroundColor}
        </span>
      </div>

      {/* Image upload */}
      <div className="flex items-center gap-3">
        <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Label className="text-xs text-muted-foreground">Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          data-ocid="background.upload_button"
          className="text-xs h-8 border-border hover:border-primary"
        >
          Choose Image
        </Button>
        {backgroundImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onImageChange(null)}
            className="text-xs h-8 text-destructive hover:text-destructive"
          >
            <Trash2Icon className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Background preview */}
      {backgroundImage && (
        <div className="relative w-full h-16 rounded-lg overflow-hidden border border-border">
          <img
            src={backgroundImage}
            alt="Background preview"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
            Custom BG
          </span>
        </div>
      )}
    </div>
  );
}
