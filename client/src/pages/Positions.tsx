import { useEffect, useState } from "react";
import { usePositionStore, type Position } from "../store/usePositionStore";
import { useAuthStore } from "../store/useAuthStore";
import PositionModal from "../components/positions/PositionModal";
import { useNavigate } from "react-router-dom";

export default function Positions() {
  const {
    positions,
    loading,
    error,
    search,
    selectedIds,
    conflict,
    fetchPositions,
    setSearch,
    toggleSelected,
    createPosition,
    updatePosition,
    duplicatePosition,
    deleteSelected,
    clearConflict,
  } = usePositionStore();

  const { user } = useAuthStore();
  const canManage = user?.role === "RECRUITER" || user?.role === "ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (pos: Position) => {
    setEditing(pos);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Positions</h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          className="input input-bordered input-sm w-64"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex-1" />

        {canManage && selectedIds.length === 1 && (
          <button
            className="btn btn-sm"
            onClick={() => duplicatePosition(selectedIds[0])}
          >
            Duplicate
          </button>
        )}
        {canManage && selectedIds.length > 0 && (
          <button className="btn btn-sm btn-error" onClick={deleteSelected}>
            Delete ({selectedIds.length})
          </button>
        )}
        {canManage && (
          <button className="btn btn-sm btn-primary" onClick={openCreate}>
            + New Position
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {conflict && (
        <div className="alert alert-warning mb-4">
          <span>
            That position was changed by someone else. Your edit wasn't saved —
            reopen it to see the latest version.
          </span>
          <button className="btn btn-sm" onClick={clearConflict}>
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-sm table-zebra">
          <thead>
            <tr>
              {canManage && <th className="w-8"></th>}
              <th>Title</th>
              <th>Company</th>
              <th>Level</th>
              <th>Access</th>
              <th>CVs</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <span className="loading loading-spinner" />
                </td>
              </tr>
            ) : (
              positions.map((pos) => (
                <tr
                  key={pos.id}
                  className="hover cursor-pointer"
                  onClick={() =>
                    canManage ? openEdit(pos) : navigate(`/positions/${pos.id}`)
                  }
                >
                  {canManage && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary border-2 border-base-content/40"
                        checked={selectedIds.includes(pos.id)}
                        onChange={() => toggleSelected(pos.id)}
                      />
                    </td>
                  )}
                  <td>{pos.title}</td>
                  <td>{pos.company || "—"}</td>
                  <td>{pos.level || "—"}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${pos.isPublic ? "badge-primary" : "badge-ghost"}`}
                    >
                      {pos.isPublic ? "Public" : "Restricted"}
                    </span>
                  </td>
                  <td>{pos._count?.cvs ?? 0}</td>
                  <td>{new Date(pos.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <PositionModal
          position={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            const ok = editing
              ? await updatePosition(editing.id, data, editing.version)
              : await createPosition(data);
            if (ok) setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
