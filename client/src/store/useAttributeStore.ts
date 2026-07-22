/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

export type DataType =
  | "STRING"
  | "TEXT"
  | "NUMERIC"
  | "BOOLEAN"
  | "DATE"
  | "DROPDOWN"
  | "IMAGE";

export interface Attribute {
  id: string;
  name: string;
  category: string;
  dataType: DataType;
  description: string | null;
}

interface AttributeState {
  attributes: Attribute[];
  loading: boolean;
  error: string | null;
  search: string;
  category: string;
  selectedIds: string[];
  fetchAttributes: () => Promise<void>;
  setSearch: (v: string) => void;
  setCategory: (v: string) => void;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  createAttribute: (data: Omit<Attribute, "id">) => Promise<boolean>;
  updateAttribute: (
    id: string,
    data: Omit<Attribute, "id">,
  ) => Promise<boolean>;
  deleteSelected: () => Promise<void>;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const useAttributeStore = create<AttributeState>((set, get) => ({
  attributes: [],
  loading: false,
  error: null,
  search: "",
  category: "",
  selectedIds: [],

  fetchAttributes: async () => {
    set({ loading: true, error: null });
    try {
      const { search, category } = get();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);

      const res = await fetch(`${API}/api/attributes?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load attributes");
      const data = await res.json();
      set({ attributes: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setSearch: (v) => {
    set({ search: v });
    get().fetchAttributes();
  },

  setCategory: (v) => {
    set({ category: v });
    get().fetchAttributes();
  },

  toggleSelected: (id) => {
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    }));
  },

  clearSelected: () => set({ selectedIds: [] }),

  createAttribute: async (data) => {
    try {
      const res = await fetch(`${API}/api/attributes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }
      await get().fetchAttributes();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  updateAttribute: async (id, data) => {
    try {
      const res = await fetch(`${API}/api/attributes/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }
      await get().fetchAttributes();
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  deleteSelected: async () => {
    const { selectedIds } = get();
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`${API}/api/attributes/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        }),
      ),
    );
    set({ selectedIds: [] });
    await get().fetchAttributes();
  },
}));
