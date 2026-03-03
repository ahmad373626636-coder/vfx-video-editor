import { motion } from "motion/react";
import type { Project } from "../backend.d";
import ProjectsList from "../components/ProjectsList";

interface ProjectsPageProps {
  activeProjectId: string | null;
  onLoad: (project: Project) => void;
}

export default function ProjectsPage({
  activeProjectId,
  onLoad,
}: ProjectsPageProps) {
  return (
    <div className="space-y-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-display font-extrabold text-foreground tracking-tight">
          My Projects
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tap a project to load its settings
        </p>
      </motion.div>

      <ProjectsList activeProjectId={activeProjectId} onLoad={onLoad} />
    </div>
  );
}
