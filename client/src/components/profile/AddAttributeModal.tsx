import { useEffect, useState } from "react";
import { useAttributeStore } from "../../store/useAttributeStore";

export default function AddAttributeModal({
  excludeIds,
  onClose,
  onAdd,
}: {
  excludeIds: string[];
  onClose: () => void;
  onAdd: (attributeId: string) => void;
}) {
  const { attributes, fetchAttributes } = useAttributeStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const available = attributes.filter(
    (a) =>
      !excludeIds.includes(a.id) &&
      a.name.toLowerCase().startsWith(search.toLowerCase()),
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Add Attribute</h3>

        <input
          className="input input-bordered input-sm w-full mb-3"
          placeholder="Search by prefix…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto border border-base-300 rounded-box">
          {available.length === 0 && (
            <p className="text-sm text-base-content/60 p-3">
              No matching attributes.
            </p>
          )}
          {available.map((attr) => (
            <button
              key={attr.id}
              className="w-full text-left px-3 py-2 hover:bg-base-200 flex items-center justify-between"
              onClick={() => onAdd(attr.id)}
            >
              <span className="text-sm">{attr.name}</span>
              <span className="badge badge-ghost badge-sm">
                {attr.category}
              </span>
            </button>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
