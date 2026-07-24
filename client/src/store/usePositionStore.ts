/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { Attribute } from "./useAttributeStore";

const API = import.meta.env.VITE_API_URL;

export interface PositionAttribute {
  attributeId: string;
  orderIndex: number;
  attribute: Attribute;
}

export interface Position {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  level: string | null;
  isPublic: boolean;
  maxProjects: number;
  version: number;
  createdAt: string;
  attributes: PositionAttribute[];
  _count?: { cvs: number };
}

export interface PositionInput {
  title: string;
  company: string;
  description: string;
  level: string;
  isPublic: boolean;
  maxProjects: number;
  attributeIds: string[];
}

interface PositionState {
  positions: Position[];
  loading: boolean;
  error: string | null;
  search: string;
  selectedIds: string[];
  conflict: { current: Position } | null;
  fetchPositions: () => Promise<void>;
  fetchPosition: (id: string) => Promise<Position>;
  setSearch: (v: string) => void;
  toggleSelected: (id: string) => void;
  createPosition: (data: PositionInput) => Promise<boolean>;
  fetchPositionCVs: (positionId: string) => Promise<any[]>;
  updatePosition: (
    id: string,
    data: PositionInput,
    version: number,
  ) => Promise<boolean>;
  duplicatePosition: (id: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  clearConflict: () => void;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  loading: false,
  error: null,
  search: "",
  selectedIds: [],
  conflict: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const { search } = get();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/positions?${params}`);
      if (!res.ok) throw new Error("Failed to load positions");
      const data = await res.json();
      set({ positions: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPosition: async (id: string) => {
    const res = await fetch(`${API}/api/positions/${id}`);
    if (!res.ok) throw new Error("Failed to load position");
    return res.json();
  },

  setSearch: (v) => {
    set({ search: v });
    get().fetchPositions();
  },

  toggleSelected: (id) => {
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    }));
  },

  createPosition: async (data) => {
    try {
      const res = await fetch(`${API}/api/positions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }
      await get().fetchPositions();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  updatePosition: async (id, data, version) => {
    try {
      const res = await fetch(`${API}/api/positions/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...data, version }),
      });

      if (res.status === 409) {
        const body = await res.json();
        set({ conflict: { current: body.current } });
        return false;
      }

      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }

      await get().fetchPositions();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  duplicatePosition: async (id) => {
    await fetch(`${API}/api/positions/${id}/duplicate`, {
      method: "POST",
      headers: authHeaders(),
    });
    await get().fetchPositions();
  },

  fetchPositionCVs: async (positionId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/positions/${positionId}/cvs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  deleteSelected: async () => {
    const { selectedIds } = get();
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`${API}/api/positions/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        }),
      ),
    );
    set({ selectedIds: [] });
    await get().fetchPositions();
  },

  clearConflict: () => set({ conflict: null }),
}));
