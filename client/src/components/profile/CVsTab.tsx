import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCVStore } from "../../store/useCVStore";

export default function CVsTab() {
  const { myCVs, loading, fetchMyCVs, deleteCV } = useCVStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchMyCVs();
  }, [fetchMyCVs]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedIds.map((id) => deleteCV(id)));
    setSelectedIds([]);
  };

  if (loading) return <span className="loading loading-spinner" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">My CVs</h2>
        {selectedIds.length > 0 && (
          <button
            className="btn btn-sm btn-error"
            onClick={handleDeleteSelected}
          >
            Delete ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Position</th>
              <th>Company</th>
              <th>Status</th>
              <th>Likes</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {myCVs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-base-content/60 py-6"
                >
                  No CVs yet. Generate one from a Position's page.
                </td>
              </tr>
            )}
            {myCVs.map((cv) => (
              <tr key={cv.id} className="hover">
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary border-2 border-base-content/40"
                    checked={selectedIds.includes(cv.id)}
                    onChange={() => toggleSelected(cv.id)}
                  />
                </td>
                <td>
                  <Link to={`/cv/${cv.id}`} className="link link-primary">
                    {cv.position.title}
                  </Link>
                </td>
                <td>{cv.position.company || "—"}</td>
                <td>
                  <span
                    className={`badge badge-sm ${cv.status === "PUBLISHED" ? "badge-primary" : "badge-ghost"}`}
                  >
                    {cv.status}
                  </span>
                </td>
                <td>{cv._count.likes}</td>
                <td>{new Date(cv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
