export interface ChromaKeySettings {
  red: number;
  green: number;
  blue: number;
  threshold: number;
}

/**
 * Process a video frame on a canvas applying chroma key removal.
 * Pixels within `threshold` distance (Euclidean in RGB) of the key color
 * are made transparent. Operates directly on ImageData for performance.
 */
export function applyChromaKey(
  imageData: ImageData,
  settings: ChromaKeySettings,
): ImageData {
  const { red, green, blue, threshold } = settings;
  const data = imageData.data;
  const thresh2 = threshold * threshold;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dr = r - red;
    const dg = g - green;
    const db = b - blue;
    const dist2 = dr * dr + dg * dg + db * db;
    if (dist2 < thresh2) {
      data[i + 3] = 0; // fully transparent
    }
  }
  return imageData;
}

/** VFX Filter CSS filter strings */
export const VFX_FILTERS: Record<string, string> = {
  normal: "none",
  cinematic: "contrast(1.2) saturate(1.1) sepia(0.15) brightness(0.95)",
  vintage: "sepia(0.7) contrast(1.1) brightness(0.85) saturate(0.8)",
  neon: "saturate(2.5) contrast(1.3) brightness(1.1) hue-rotate(15deg)",
  bw: "grayscale(1) contrast(1.2)",
  glitch: "hue-rotate(90deg) saturate(2) contrast(1.4)",
};

export const VFX_FILTER_LABELS: Record<string, string> = {
  normal: "Normal",
  cinematic: "Cinematic",
  vintage: "Vintage",
  neon: "Neon",
  bw: "B&W",
  glitch: "Glitch",
};

export const VFX_FILTER_COLORS: Record<string, string> = {
  normal: "#666",
  cinematic: "#c97a2a",
  vintage: "#8b6a3e",
  neon: "#00ffcc",
  bw: "#999",
  glitch: "#ff00ff",
};

/**
 * Apply a VFX filter to canvas ImageData (for export).
 * For preview we use CSS `filter`, but for PNG export we
 * do a simplified pixel-level pass.
 */
export function applyVfxFilterToImageData(
  imageData: ImageData,
  filterName: string,
): ImageData {
  if (filterName === "normal") return imageData;
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;

    switch (filterName) {
      case "cinematic": {
        // warm + contrast boost
        r = Math.min(255, r * 1.15 + 15);
        g = Math.min(255, g * 1.05);
        b = Math.max(0, b * 0.9);
        break;
      }
      case "vintage": {
        // sepia-like
        const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        r = sr;
        g = sg;
        b = sb;
        break;
      }
      case "neon": {
        // boost saturation
        const avg = (r + g + b) / 3;
        r = Math.min(255, avg + (r - avg) * 2.5);
        g = Math.min(255, avg + (g - avg) * 2.5);
        b = Math.min(255, avg + (b - avg) * 2.5);
        break;
      }
      case "bw": {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = Math.min(255, lum * 1.2);
        break;
      }
      case "glitch": {
        // swap channels
        const tmp = r;
        r = g;
        g = b;
        b = tmp;
        break;
      }
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  return imageData;
}
