import { useEffect } from "react";
import { useProfileStore } from "../../store/useProfileStore";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
  return initials.join("") || "?";
}

export default function MeTab() {
  const {
    name,
    location,
    avatarUrl,
    loading,
    saving,
    conflict,
    error,
    fetchProfile,
    setField,
    resolveConflict,
  } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <span className="loading loading-spinner" />;

  return (
    <div className="card bg-base-100 max-w-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Me</h2>
        <span className="text-xs text-base-content/60">
          {saving ? "Saving…" : "Saved"}
        </span>
      </div>

      {conflict && (
        <div className="alert alert-warning mb-4">
          <span>This profile changed elsewhere. Your edits weren't saved.</span>
          <button className="btn btn-sm" onClick={resolveConflict}>
            Reload latest
          </button>
        </div>
      )}

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="flex items-center gap-4 mb-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-semibold">
            {getInitials(name)}
          </div>
        )}
        <div>
          <div className="font-medium">{name || "Unnamed"}</div>
          <div className="text-sm text-base-content/60">
            {location || "No location set"}
          </div>
        </div>
      </div>

      <label className="label mb-1">Name</label>
      <input
        className="input input-bordered w-full mb-4"
        value={name}
        onChange={(e) => setField("name", e.target.value)}
      />

      <label className="label mb-1">Location</label>
      <input
        className="input input-bordered w-full mb-4"
        value={location}
        onChange={(e) => setField("location", e.target.value)}
      />
    </div>
  );
}
