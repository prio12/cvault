import { useEffect } from "react";
import { useProfileStore } from "../../store/useProfileStore";

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
      <h2 className="text-xl font-bold mb-4">Me</h2>

      {conflict && (
        <div className="alert alert-warning mb-4">
          <span>This profile changed elsewhere. Your edits weren't saved.</span>
          <button className="btn btn-sm" onClick={resolveConflict}>
            Reload latest
          </button>
        </div>
      )}

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <label className="label">Name</label>
      <input
        className="input input-bordered w-full mb-4"
        value={name}
        onChange={(e) => setField("name", e.target.value)}
      />

      <label className="label">Location</label>
      <input
        className="input input-bordered w-full mb-4"
        value={location}
        onChange={(e) => setField("location", e.target.value)}
      />

      {avatarUrl && (
        <img src={avatarUrl} className="w-16 h-16 rounded-full mb-4" />
      )}

      <div className="text-sm text-base-content/60">
        {saving ? "Saving…" : "Saved"}
      </div>
    </div>
  );
}
