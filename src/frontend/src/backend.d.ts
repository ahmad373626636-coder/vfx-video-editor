import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Threshold = number;
export type ProjectId = string;
export interface ChromaKey {
    red: Threshold;
    threshold: Threshold;
    blue: Threshold;
    green: Threshold;
}
export interface Project {
    id: ProjectId;
    filters: Array<Filter>;
    background?: ExternalBlob;
    name: string;
    chromaKey: ChromaKey;
}
export type Filter = string;
export interface backendInterface {
    addFilter(projectId: ProjectId, filter: Filter): Promise<void>;
    createProject(projectId: ProjectId, name: string): Promise<void>;
    deleteProject(projectId: ProjectId): Promise<void>;
    getProject(projectId: ProjectId): Promise<Project>;
    listProjects(): Promise<Array<Project>>;
    setBackground(projectId: ProjectId, background: ExternalBlob | null): Promise<void>;
    updateChromaKey(projectId: ProjectId, chromaKey: ChromaKey): Promise<void>;
}
