import { Button } from "@/components/ui/button";
import { FolderIcon, FolderOpenIcon, Loader2, Trash2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Project } from "../backend.d";
import { useDeleteProject, useListProjects } from "../hooks/useQueries";

interface ProjectsListProps {
  activeProjectId: string | null;
  onLoad: (project: Project) => void;
}

export default function ProjectsList({
  activeProjectId,
  onLoad,
}: ProjectsListProps) {
  const { data: projects, isLoading, isError } = useListProjects();
  const deleteProject = useDeleteProject();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  }

  if (isLoading) {
    return (
      <div
        data-ocid="projects.loading_state"
        className="flex flex-col items-center justify-center py-16 gap-3"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="projects.error_state"
        className="flex flex-col items-center justify-center py-16 gap-3 text-center"
      >
        <p className="text-sm text-destructive">Failed to load projects</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div
        data-ocid="projects.empty_state"
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
          <FolderIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Save your first project from the Editor tab
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="projects.list" className="space-y-2">
      <AnimatePresence>
        {projects.map((project, i) => {
          const isActive = project.id === activeProjectId;
          return (
            <motion.div
              key={project.id}
              data-ocid={`project.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onLoad(project)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                ${
                  isActive
                    ? "border-primary/60 bg-primary/5 vfx-glow-cyan"
                    : "border-border bg-surface-1 hover:border-border/80 hover:bg-surface-2"
                }`}
            >
              <div
                className={`p-2 rounded-lg ${isActive ? "bg-primary/10" : "bg-surface-2"}`}
              >
                <FolderOpenIcon
                  className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {project.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Filters: {project.filters.join(", ") || "none"} · Key: rgb(
                  {project.chromaKey.red}, {project.chromaKey.green},{" "}
                  {project.chromaKey.blue})
                </p>
              </div>

              {isActive && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                  ACTIVE
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                data-ocid={`project.delete_button.${i + 1}`}
                onClick={(e) => handleDelete(project.id, e)}
                disabled={deleteProject.isPending}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                {deleteProject.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2Icon className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
