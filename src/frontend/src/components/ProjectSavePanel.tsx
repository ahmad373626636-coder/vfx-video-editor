import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, SaveIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddFilter,
  useCreateProject,
  useUpdateChromaKey,
} from "../hooks/useQueries";
import type { ChromaKeySettings } from "../utils/chromaKey";

interface ProjectSavePanelProps {
  activeProjectId: string | null;
  chromaKey: ChromaKeySettings;
  filterName: string;
  onProjectCreated: (id: string) => void;
}

export default function ProjectSavePanel({
  activeProjectId,
  chromaKey,
  filterName,
  onProjectCreated,
}: ProjectSavePanelProps) {
  const [projectName, setProjectName] = useState("");

  const createProject = useCreateProject();
  const updateChromaKey = useUpdateChromaKey();
  const addFilter = useAddFilter();

  const isSaving =
    createProject.isPending || updateChromaKey.isPending || addFilter.isPending;

  async function handleSave() {
    const name = projectName.trim() || "Untitled Project";
    const id = activeProjectId ?? `project_${Date.now()}`;

    try {
      if (!activeProjectId) {
        await createProject.mutateAsync({ projectId: id, name });
        onProjectCreated(id);
      }

      await Promise.all([
        updateChromaKey.mutateAsync({ projectId: id, chromaKey }),
        addFilter.mutateAsync({ projectId: id, filter: filterName }),
      ]);

      toast.success("Project saved!");
      setProjectName("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name…"
        data-ocid="project.input"
        className="flex-1 h-11 text-sm bg-surface-2 border-border focus:border-primary"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />
      <Button
        onClick={handleSave}
        disabled={isSaving}
        data-ocid="project.save_button"
        className="h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <SaveIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
