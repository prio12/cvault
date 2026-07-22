/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

let saveTimer: ReturnType<typeof setTimeout> | null = null;

interface ProfileState {
  name: string;
  location: string;
  avatarUrl: string | null;
  version: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
  conflict: boolean;
  fetchProfile: () => Promise<void>;
  setField: (field: "name" | "location", value: string) => void;
  saveProfile: () => Promise<void>;
  resolveConflict: () => Promise<void>;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  name: "",
  location: "",
  avatarUrl: null,
  version: 0,
  loading: false,
  saving: false,
  error: null,
  conflict: false,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/profile/me`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      set({
        name: data.name || "",
        location: data.location || "",
        avatarUrl: data.avatarUrl,
        version: data.version,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setField: (field, value) => {
    set({ [field]: value } as any);

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      get().saveProfile();
    }, 7000);
  },

  saveProfile: async () => {
    const { name, location, version } = get();
    set({ saving: true, error: null });
    try {
      const res = await fetch(`${API}/api/profile/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ name, location, version }),
      });

      if (res.status === 409) {
        set({ saving: false, conflict: true });
        return;
      }

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      set({
        name: data.name,
        location: data.location,
        version: data.version,
        saving: false,
        conflict: false,
      });
    } catch (err: any) {
      set({ error: err.message, saving: false });
    }
  },

  resolveConflict: async () => {
    await get().fetchProfile();
    set({ conflict: false });
  },
}));
