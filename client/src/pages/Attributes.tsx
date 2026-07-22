import { useEffect, useState } from "react";
import { useAttributeStore, type Attribute } from "../store/useAttributeStore";
import AttributeModal from "../components/attributes/AttributeModal";
import { useAuthStore } from "../store/useAuthStore";

const CATEGORIES = [
  "Certification",
  "Domain Knowledge",
  "Personal Information",
  "Soft Skills",
  "Language",
  "Technical Skills",
];

export default function Attributes() {
  const {
    attributes,
    loading,
    error,
    search,
    category,
    selectedIds,
    fetchAttributes,
    setSearch,
    setCategory,
    toggleSelected,
    deleteSelected,
    createAttribute,
    updateAttribute,
  } = useAttributeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attribute | null>(null);

  const { user } = useAuthStore();
  const canManage = user?.role === "RECRUITER" || user?.role === "ADMIN";

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (attr: Attribute) => {
    setEditing(attr);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Attribute Library</h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          className="input input-bordered input-sm w-48"
          placeholder="Search by prefix…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered select-sm w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex-1" />
        {canManage && selectedIds.length > 0 && (
          <button className="btn btn-sm btn-error" onClick={deleteSelected}>
            Delete ({selectedIds.length})
          </button>
        )}
        {canManage && (
          <button className="btn btn-sm btn-primary" onClick={openCreate}>
            + New Attribute
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="table table-sm table-zebra">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Name</th>
              <th>Category</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <span className="loading loading-spinner" />
                </td>
              </tr>
            ) : (
              attributes.map((attr) => (
                <tr
                  key={attr.id}
                  className={canManage ? "hover cursor-pointer" : ""}
                  onClick={() => canManage && openEdit(attr)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    {canManage && (
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary border-2 border-base-content/40"
                        checked={selectedIds.includes(attr.id)}
                        onChange={() => toggleSelected(attr.id)}
                      />
                    )}
                  </td>
                  <td>{attr.name}</td>
                  <td>{attr.category}</td>
                  <td>{attr.dataType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AttributeModal
          attribute={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            const ok = editing
              ? await updateAttribute(editing.id, data)
              : await createAttribute(data);
            if (ok) setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
