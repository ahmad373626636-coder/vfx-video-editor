import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { ChromaKey, Project } from "../backend.d";
import { useActor } from "./useActor";

// ── List all projects ────────────────────────────────────────────────────────
export function useListProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Get single project ───────────────────────────────────────────────────────
export function useGetProject(projectId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!actor || !projectId) throw new Error("No project id");
      return actor.getProject(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

// ── Create project ───────────────────────────────────────────────────────────
export function useCreateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      name,
    }: { projectId: string; name: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.createProject(projectId, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ── Delete project ───────────────────────────────────────────────────────────
export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteProject(projectId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ── Update chroma key ────────────────────────────────────────────────────────
export function useUpdateChromaKey() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      chromaKey,
    }: { projectId: string; chromaKey: ChromaKey }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateChromaKey(projectId, chromaKey);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project", vars.projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ── Add filter ───────────────────────────────────────────────────────────────
export function useAddFilter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      filter,
    }: { projectId: string; filter: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.addFilter(projectId, filter);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project", vars.projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ── Set background ───────────────────────────────────────────────────────────
export function useSetBackground() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      backgroundUrl,
    }: {
      projectId: string;
      backgroundUrl: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      const blob = backgroundUrl ? ExternalBlob.fromURL(backgroundUrl) : null;
      await actor.setBackground(projectId, blob);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project", vars.projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
