import { useEffect, useState } from "react";
import {
  useProfileAttributeStore,
  type ProfileAttributeEntry,
} from "../../store/useProfileAttributeStore";
import AddAttributeModal from "./AddAttributeModal";

function ValueInput({ entry }: { entry: ProfileAttributeEntry }) {
  const { setValue } = useProfileAttributeStore();
  const { attributeId, value, attribute } = entry;

  switch (attribute.dataType) {
    case "BOOLEAN":
      return (
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={value === "true"}
          onChange={(e) =>
            setValue(attributeId, String(e.target.checked), true)
          }
        />
      );

    case "NUMERIC":
      return (
        <input
          type="number"
          className="input input-bordered input-sm w-full"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value)}
        />
      );

    case "DATE":
      return (
        <input
          type="date"
          className="input input-bordered input-sm w-full"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value, true)}
        />
      );

    case "TEXT":
      return (
        <textarea
          className="textarea textarea-bordered textarea-sm w-full"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value)}
        />
      );

    case "DROPDOWN":
      return (
        <select
          className="select select-bordered select-sm w-full"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value, true)}
        >
          <option value="">— select —</option>
          {attribute.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "IMAGE":
      return (
        <input
          className="input input-bordered input-sm w-full"
          placeholder="Image URL…"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value, true)}
        />
      );

    case "STRING":
    default:
      return (
        <input
          className="input input-bordered input-sm w-full"
          value={value ?? ""}
          onChange={(e) => setValue(attributeId, e.target.value)}
        />
      );
  }
}

export default function InfoTab() {
  const { entries, loading, fetchEntries, addAttribute, removeAttribute } =
    useProfileAttributeStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedIds.map((id) => removeAttribute(id)));
    setSelectedIds([]);
  };

  if (loading) return <span className="loading loading-spinner" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Info</h2>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              className="btn btn-sm btn-error"
              onClick={handleDeleteSelected}
            >
              Remove ({selectedIds.length})
            </button>
          )}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setModalOpen(true)}
          >
            + Add Attribute
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Attribute</th>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-base-content/60 py-6"
                >
                  No attributes added yet. Click "+ Add Attribute" to get
                  started.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.attributeId}>
                <td>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary border-2 border-base-content/40"
                    checked={selectedIds.includes(entry.attributeId)}
                    onChange={() => toggleSelected(entry.attributeId)}
                  />
                </td>
                <td>{entry.attribute.name}</td>
                <td>
                  <span className="badge badge-ghost badge-sm">
                    {entry.attribute.category}
                  </span>
                </td>
                <td className="max-w-xs">
                  <ValueInput entry={entry} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddAttributeModal
          excludeIds={entries.map((e) => e.attributeId)}
          onClose={() => setModalOpen(false)}
          onAdd={async (attributeId) => {
            await addAttribute(attributeId);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
