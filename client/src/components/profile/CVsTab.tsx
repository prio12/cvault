import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCVStore } from "../../store/useCVStore";

export default function CVsTab() {
  const { myCVs, loading, fetchMyCVs } = useCVStore();

  useEffect(() => {
    fetchMyCVs();
  }, [fetchMyCVs]);

  if (loading) return <span className="loading loading-spinner" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My CVs</h2>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
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
                  colSpan={5}
                  className="text-center text-base-content/60 py-6"
                >
                  No CVs yet. Generate one from a Position's page.
                </td>
              </tr>
            )}
            {myCVs.map((cv) => (
              <tr key={cv.id} className="hover">
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
