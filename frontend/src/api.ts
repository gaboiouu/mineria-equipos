const API: string = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface EquipmentType {
    id: number;
    name: string;
    intervalHours: number;
}

export interface Equipment {
    id: number;
    code: string;
    typeId: number;
    type: string;
    hourMeter: number;
    lastMaintenanceHours: number;
    intervalHours: number;
    hoursSinceMaintenance: number;
    requiresMaintenance: boolean;
    status: string;
}

export interface EquipmentInput {
    code: string;
    typeId: number;
    hourMeter: number;
}

export interface MaintenanceRecord {
    id: number;
    equipmentId: number;
    performedAt: string;
    hourMeterAtService: number;
    notes: string | null;
}

interface ApiError {
    error?: string;
    details?: { field: string; message: string }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(API + path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (res.status === 204) return undefined as T;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const err = data as ApiError | null;
        const detail = err?.details?.map((d) => d.message).join(", ");
        throw new Error(detail || err?.error || "Error de red");
    }
    return data as T;
}

export const api = {
    health: () => request<{ status: string }>("/health"),
    types: () => request<EquipmentType[]>("/equipment-types"),
    list: () => request<{ data: Equipment[] }>("/equipment?limit=100"),
    create: (body: EquipmentInput) =>
        request<Equipment>("/equipment", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: EquipmentInput) =>
        request<Equipment>(`/equipment/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: number) => request<void>(`/equipment/${id}`, { method: "DELETE" }),
    registerMaintenance: (id: number, notes?: string) =>
        request<unknown>(`/equipment/${id}/maintenance`, {
            method: "POST",
            body: JSON.stringify({ notes }),
        }),
    history: (id: number) => request<MaintenanceRecord[]>(`/equipment/${id}/maintenance`),
};