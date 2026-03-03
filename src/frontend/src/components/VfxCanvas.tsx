import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  VFX_FILTERS,
  applyChromaKey,
  applyVfxFilterToImageData,
} from "../utils/chromaKey";
import type { ChromaKeySettings } from "../utils/chromaKey";

export interface VfxCanvasHandle {
  renderFrame: () => void;
  captureFrame: () => string | null;
}

interface VfxCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  chromaKey: ChromaKeySettings;
  chromaKeyEnabled: boolean;
  filterName: string;
  backgroundColor: string;
  backgroundImage: string | null;
}

const VfxCanvas = forwardRef<VfxCanvasHandle, VfxCanvasProps>(
  function VfxCanvas(
    {
      videoRef,
      chromaKey,
      chromaKeyEnabled,
      filterName,
      backgroundColor,
      backgroundImage,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgImgRef = useRef<HTMLImageElement | null>(null);
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);

    // Keep bg image updated
    useEffect(() => {
      if (!backgroundImage) {
        bgImgRef.current = null;
        return;
      }
      const img = new Image();
      img.onload = () => {
        bgImgRef.current = img;
      };
      img.src = backgroundImage;
    }, [backgroundImage]);

    const renderFrame = useCallback(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const w = video.videoWidth || canvas.width;
      const h = video.videoHeight || canvas.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // 1. Draw background
      if (backgroundImage && bgImgRef.current) {
        ctx.drawImage(bgImgRef.current, 0, 0, w, h);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      if (!chromaKeyEnabled) {
        // No chroma key - just draw the video with CSS filter
        ctx.filter = VFX_FILTERS[filterName] || "none";
        ctx.drawImage(video, 0, 0, w, h);
        ctx.filter = "none";
        return;
      }

      // 2. Chroma key: draw video to offscreen canvas, extract ImageData
      if (!offscreenRef.current) {
        offscreenRef.current = document.createElement("canvas");
      }
      const off = offscreenRef.current;
      off.width = w;
      off.height = h;
      const offCtx = off.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.drawImage(video, 0, 0, w, h);
      let imageData = offCtx.getImageData(0, 0, w, h);

      // 3. Remove chroma key pixels
      imageData = applyChromaKey(imageData, chromaKey);

      // 4. Apply VFX filter to pixel data for export accuracy
      // (CSS filter is applied on canvas element for live preview)
      imageData = applyVfxFilterToImageData(imageData, filterName);

      // 5. Composite on top of background
      offCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(off, 0, 0, w, h);
    }, [
      videoRef,
      chromaKey,
      chromaKeyEnabled,
      filterName,
      backgroundColor,
      backgroundImage,
    ]);

    useImperativeHandle(ref, () => ({
      renderFrame,
      captureFrame: () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        data-ocid="editor.canvas_target"
        className="w-full rounded-lg"
        style={{
          background: backgroundColor,
          filter: chromaKeyEnabled ? "none" : VFX_FILTERS[filterName] || "none",
          aspectRatio: "16/9",
          display: "block",
          objectFit: "contain",
          maxHeight: "280px",
        }}
      />
    );
  },
);

export default VfxCanvas;
