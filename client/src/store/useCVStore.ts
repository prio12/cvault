/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

export interface CVAttribute {
  attributeId: string;
  name: string;
  category: string;
  dataType: string;
  options: string[];
  value: string | null;
}

export interface CVDetail {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  candidateName: string;
  location: string | null;
  canEdit: boolean;
  position: {
    id: string;
    title: string;
    company: string | null;
    level: string | null;
  };
  attributes: CVAttribute[];
}

export interface MyCV {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  position: { title: string; company: string | null };
  _count: { likes: number };
}

interface CVState {
  current: CVDetail | null;
  myCVs: MyCV[];
  loading: boolean;
  error: string | null;
  publishError: { missing: string[] } | null;
  createCV: (positionId: string) => Promise<string | null>;
  fetchCV: (id: string) => Promise<void>;
  fetchMyCVs: () => Promise<void>;
  setAttributeValue: (attributeId: string, value: string) => void;
  saveAttributeValue: (attributeId: string, value: string) => Promise<boolean>;
  deleteCV: (id: string) => Promise<boolean>;
  publish: () => Promise<boolean>;
  clearPublishError: () => void;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const useCVStore = create<CVState>((set, get) => ({
  current: null,
  myCVs: [],
  loading: false,
  error: null,
  publishError: null,

  createCV: async (positionId) => {
    try {
      const res = await fetch(`${API}/api/cv`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ positionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return null;
      }
      const data = await res.json();
      return data.id;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  fetchCV: async (id) => {
    set({ loading: true, error: null, current: null });
    try {
      const res = await fetch(`${API}/api/cv/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load CV");
      }
      const data = await res.json();
      set({ current: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyCVs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/cv/mine`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load CVs");
      const data = await res.json();
      set({ myCVs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setAttributeValue: (attributeId, value) => {
    set((s) => {
      if (!s.current) return s;
      return {
        current: {
          ...s.current,
          attributes: s.current.attributes.map((a) =>
            a.attributeId === attributeId ? { ...a, value } : a,
          ),
        },
      };
    });
  },

  saveAttributeValue: async (attributeId, value) => {
    const { current } = get();
    if (!current) return false;
    try {
      const res = await fetch(
        `${API}/api/cv/${current.id}/attributes/${attributeId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ value }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  deleteCV: async (id: string) => {
    const res = await fetch(`${API}/api/cv/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      set((s) => ({ myCVs: s.myCVs.filter((cv) => cv.id !== id) }));
    }
    return res.ok;
  },

  publish: async () => {
    const { current } = get();
    if (!current) return false;
    set({ publishError: null });
    try {
      const res = await fetch(`${API}/api/cv/${current.id}/publish`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.status === 400) {
        const err = await res.json();
        set({ publishError: { missing: err.missing || [] } });
        return false;
      }
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error });
        return false;
      }
      const data = await res.json();
      set((s) => ({
        current: s.current ? { ...s.current, status: data.status } : s.current,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  clearPublishError: () => set({ publishError: null }),
}));
