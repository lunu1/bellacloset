// components/CategoryTreeSelect.jsx
import { useMemo } from "react";

/**
 * props:
 * - categories: full array from API (each item may contain .children[])
 * - valuePath: string[] of selected ids from root -> leaf (e.g. ["WomenId","BagsId","ShoulderBagId"])
 * - onChange: (newPath: string[]) => void
 * - placeholder?: string
 */
export default function CategoryTreeSelect({
  categories = [],
  valuePath = [],
  onChange,
  placeholder = "Select…",
}) {
  // Build a quick map for lookups
  const idToNode = useMemo(() => {
    const map = new Map();
    const visit = (node) => {
      map.set(node._id, node);
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };
    categories.forEach(visit);
    return map;
  }, [categories]);

  // Top-level nodes are those with parent === null
  const topLevel = useMemo(() => {
    return categories.filter((c) => !c.parent);
  }, [categories]);

  // Helper to get children of a nodeId (or top-level if none)
  const getChildren = (nodeId) => {
    if (!nodeId) return topLevel;
    const node = idToNode.get(nodeId);
    return node?.children || [];
  };

  // Build the arrays of options per level based on current valuePath
  const levels = useMemo(() => {
    const arr = [];
    // Level 0 uses top level
    arr.push(getChildren(null));
    // For each chosen id in the path, next level is its children
    for (let i = 0; i < valuePath.length; i++) {
      const nodeId = valuePath[i];
      const children = getChildren(nodeId);
      if (children.length > 0) {
        arr.push(children);
      }
    }
    return arr;
  }, [valuePath, idToNode, topLevel]);

  const handleLevelChange = (levelIndex, nextId) => {
    // Truncate any deeper selections if user changes a higher level
    const nextPath = valuePath.slice(0, levelIndex);
    if (nextId) nextPath.push(nextId);
    onChange(nextPath);
  };

  return (
    <div className="space-y-2">
      {levels.map((options, levelIdx) => {
        // Current selection for this level (if exists)
        const selectedAtLevel = valuePath[levelIdx] || "";

        // If there are no options at this level, don't render it
        if (!options || options.length === 0) return null;

        return (
          <select
            key={levelIdx}
            className="border p-2 w-full"
            value={selectedAtLevel}
            onChange={(e) => handleLevelChange(levelIdx, e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt._id} value={opt._id}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
