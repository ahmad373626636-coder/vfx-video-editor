import { Button } from "@/components/ui/button";
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  UploadIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { Project } from "../backend.d";
import BackgroundPanel from "../components/BackgroundPanel";
import ChromaKeyPanel from "../components/ChromaKeyPanel";
import FilterSelector from "../components/FilterSelector";
import ProjectSavePanel from "../components/ProjectSavePanel";
import VfxCanvas, { type VfxCanvasHandle } from "../components/VfxCanvas";
import type { ChromaKeySettings } from "../utils/chromaKey";

interface EditorPageProps {
  loadedProject: Project | null;
}

const DEFAULT_CHROMA: ChromaKeySettings = {
  red: 0,
  green: 180,
  blue: 0,
  threshold: 80,
};

type Panel = "chromakey" | "background" | "save" | null;

export default function EditorPage({ loadedProject }: EditorPageProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterName, setFilterName] = useState("normal");
  const [chromaKeyEnabled, setChromaKeyEnabled] = useState(false);
  const [chromaKey, setChromaKey] = useState<ChromaKeySettings>(DEFAULT_CHROMA);
  const [backgroundColor, setBackgroundColor] = useState("#001a2a");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [renderTick, setRenderTick] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<VfxCanvasHandle>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);

  // Load project settings when a project is loaded from Projects tab
  useEffect(() => {
    if (!loadedProject) return;
    setActiveProjectId(loadedProject.id);
    setChromaKey(loadedProject.chromaKey);
    if (loadedProject.filters.length > 0) {
      setFilterName(loadedProject.filters[loadedProject.filters.length - 1]);
    }
    toast.success(`Loaded: ${loadedProject.name}`);
  }, [loadedProject]);

  // Render loop – only runs when video is playing
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    function loop() {
      canvasRef.current?.renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  // Re-render on any settings change (single frame)
  useEffect(() => {
    if (!isPlaying && renderTick > 0) {
      canvasRef.current?.renderFrame();
    }
  }, [renderTick, isPlaying]);

  function triggerRender() {
    setRenderTick((t) => t + 1);
  }

  function handleVideoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setIsPlaying(false);
    setTimeout(() => {
      canvasRef.current?.renderFrame();
    }, 300);
  }

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      void video.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  function handleCapture() {
    // Render once more to make sure we have latest frame
    canvasRef.current?.renderFrame();
    const dataUrl = canvasRef.current?.captureFrame();
    if (!dataUrl) {
      toast.error("No frame to capture");
      return;
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `vfx-frame-${Date.now()}.png`;
    link.click();
    toast.success("Frame saved as PNG!");
  }

  function togglePanel(panel: Panel) {
    setOpenPanel((p) => (p === panel ? null : panel));
  }

  const panelButtonClass = (panel: Panel) =>
    `flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all
    ${
      openPanel === panel
        ? "border-primary/60 bg-primary/5 text-primary"
        : "border-border bg-surface-1 text-foreground hover:border-border/80"
    }`;

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* ─── Video Upload ──────────────────────────────────── */}
      <section className="space-y-2">
        <input
          ref={videoFileRef}
          type="file"
          accept="video/mp4,video/webm,video/*"
          className="hidden"
          onChange={handleVideoUpload}
        />
        {!videoSrc ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            data-ocid="editor.upload_button"
            onClick={() => videoFileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-surface-1 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center vfx-glow-cyan">
              <UploadIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                Upload Video
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM supported
              </p>
            </div>
          </motion.button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              className="hidden"
              loop
              playsInline
              muted
              onLoadedData={() => canvasRef.current?.renderFrame()}
              onSeeked={() => canvasRef.current?.renderFrame()}
            />
            <VfxCanvas
              ref={canvasRef}
              videoRef={videoRef}
              chromaKey={chromaKey}
              chromaKeyEnabled={chromaKeyEnabled}
              filterName={filterName}
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
            />

            {/* Overlay controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="h-9 w-9 p-0 text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={triggerRender}
                className="h-9 w-9 p-0 text-white hover:bg-white/20"
                title="Re-render frame"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </Button>

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => videoFileRef.current?.click()}
                data-ocid="editor.upload_button"
                className="h-9 px-3 text-xs text-white hover:bg-white/20"
              >
                <UploadIcon className="w-3.5 h-3.5 mr-1" />
                Change
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ─── VFX Filter Selector ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            VFX Style
          </h2>
          <span
            data-ocid="filter.tab"
            className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full"
          >
            {filterName.toUpperCase()}
          </span>
        </div>
        <FilterSelector
          active={filterName}
          onChange={(f) => {
            setFilterName(f);
            triggerRender();
          }}
        />
      </section>

      {/* ─── Collapsible Panels ───────────────────────────── */}
      <section className="space-y-2">
        {/* Chroma Key panel */}
        <div>
          <button
            type="button"
            onClick={() => togglePanel("chromakey")}
            data-ocid="chromakey.toggle"
            className={panelButtonClass("chromakey")}
          >
            <span>🟢 Chroma Key (Green Screen)</span>
            {openPanel === "chromakey" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence>
            {openPanel === "chromakey" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 p-4 rounded-xl bg-surface-1 border border-border">
                  <ChromaKeyPanel
                    enabled={chromaKeyEnabled}
                    onToggle={(v) => {
                      setChromaKeyEnabled(v);
                      triggerRender();
                    }}
                    settings={chromaKey}
                    onChange={(s) => {
                      setChromaKey(s);
                      triggerRender();
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Background panel */}
        <div>
          <button
            type="button"
            onClick={() => togglePanel("background")}
            className={panelButtonClass("background")}
          >
            <span>🖼 Background</span>
            {openPanel === "background" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence>
            {openPanel === "background" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 p-4 rounded-xl bg-surface-1 border border-border">
                  <BackgroundPanel
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    onColorChange={(c) => {
                      setBackgroundColor(c);
                      triggerRender();
                    }}
                    onImageChange={(url) => {
                      setBackgroundImage(url);
                      triggerRender();
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save project panel */}
        <div>
          <button
            type="button"
            onClick={() => togglePanel("save")}
            className={panelButtonClass("save")}
          >
            <span>💾 Save Project</span>
            {openPanel === "save" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence>
            {openPanel === "save" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 p-4 rounded-xl bg-surface-1 border border-border">
                  <ProjectSavePanel
                    activeProjectId={activeProjectId}
                    chromaKey={chromaKey}
                    filterName={filterName}
                    onProjectCreated={(id) => setActiveProjectId(id)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Floating Capture Button ──────────────────────── */}
      <div className="fixed bottom-20 right-4 z-50">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          data-ocid="editor.capture_button"
          onClick={handleCapture}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center vfx-glow-cyan shadow-lg"
          title="Capture Frame"
        >
          <CameraIcon className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
