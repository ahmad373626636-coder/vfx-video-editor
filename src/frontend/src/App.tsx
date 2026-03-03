import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "./backend.d";
import EditorPage from "./pages/EditorPage";
import ProjectsPage from "./pages/ProjectsPage";

type Tab = "editor" | "projects";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [loadedProject, setLoadedProject] = useState<Project | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  function handleLoadProject(project: Project) {
    setLoadedProject(project);
    setActiveProjectId(project.id);
    setActiveTab("editor");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <img
          src="/assets/generated/vfx-logo-transparent.dim_120x120.png"
          alt="VFX Editor"
          className="w-8 h-8 rounded-lg"
        />
        <div>
          <h1 className="text-sm font-display font-extrabold tracking-tight vfx-text-cyan leading-none">
            VFX EDITOR
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono">
            Green Screen · Style · Export
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">
            READY
          </span>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === "editor" ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <EditorPage loadedProject={loadedProject} />
            </motion.div>
          ) : (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectsPage
                activeProjectId={activeProjectId}
                onLoad={handleLoadProject}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Bottom Nav ──────────────────────────────────────── */}
      <nav className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-4 pb-safe">
        <div className="flex">
          <NavTab
            id="editor"
            label="Editor"
            icon="🎬"
            active={activeTab === "editor"}
            ocid="nav.editor_tab"
            onClick={() => setActiveTab("editor")}
          />
          <NavTab
            id="projects"
            label="Projects"
            icon="📁"
            active={activeTab === "projects"}
            ocid="nav.projects_tab"
            onClick={() => setActiveTab("projects")}
          />
        </div>
      </nav>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="text-center py-2 px-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-surface-2 border-border text-foreground",
          },
        }}
      />
    </div>
  );
}

// ─── NavTab Component ─────────────────────────────────────────
interface NavTabProps {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  ocid: string;
  onClick: () => void;
}

function NavTab({ label, icon, active, ocid, onClick }: NavTabProps) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-all relative
        ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-b-full vfx-glow-cyan"
        />
      )}
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-semibold tracking-wide uppercase">
        {label}
      </span>
    </button>
  );
}
