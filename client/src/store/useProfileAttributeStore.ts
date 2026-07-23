/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { Attribute } from "./useAttributeStore";

const API = import.meta.env.VITE_API_URL;

export interface ProfileAttributeEntry {
  attributeId: string;
  value: string | null;
  updatedAt: string;
  attribute: Attribute;
}

interface ProfileAttributeState {
  entries: ProfileAttributeEntry[];
  loading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addAttribute: (attributeId: string) => Promise<void>;
  setValue: (attributeId: string, value: string, immediate?: boolean) => void;
  removeAttribute: (attributeId: string) => Promise<void>;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

async function persistValue(attributeId: string, value: string) {
  try {
    await fetch(`${API}/api/profile/attributes/${attributeId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ value }),
    });
  } catch (err) {
    console.error("Failed to save attribute value:", err);
  }
}

export const useProfileAttributeStore = create<ProfileAttributeState>(
  (set, get) => ({
    entries: [],
    loading: false,
    error: null,

    fetchEntries: async () => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`${API}/api/profile/attributes`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load attributes");
        const data = await res.json();
        set({ entries: data, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    addAttribute: async (attributeId) => {
      try {
        const res = await fetch(`${API}/api/profile/attributes`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ attributeId }),
        });
        if (!res.ok) {
          const err = await res.json();
          set({ error: err.error });
          return;
        }
        await get().fetchEntries();
      } catch (err: any) {
        set({ error: err.message });
      }
    },

    setValue: (attributeId, value, immediate = false) => {
      set((s) => ({
        entries: s.entries.map((e) =>
          e.attributeId === attributeId ? { ...e, value } : e,
        ),
      }));

      if (saveTimers[attributeId]) clearTimeout(saveTimers[attributeId]);

      if (immediate) {
        persistValue(attributeId, value);
      } else {
        saveTimers[attributeId] = setTimeout(() => {
          persistValue(attributeId, value);
        }, 5000);
      }
    },

    removeAttribute: async (attributeId) => {
      await fetch(`${API}/api/profile/attributes/${attributeId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      set((s) => ({
        entries: s.entries.filter((e) => e.attributeId !== attributeId),
      }));
    },
  }),
);
