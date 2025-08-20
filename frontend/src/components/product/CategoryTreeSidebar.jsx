import { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

/**
 * Black & white tree sidebar with:
 * - Search-as-you-type
 * - Expand/Collapse All
 * - Active highlight
 * - Deep mode navigation while preserving current filters
 */
export default function CategoryTreeSidebar({ categories = [] }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set()); // holds ids

  const deep = searchParams.get("deep") === "1";

  const idToNode = useMemo(() => {
    const m = new Map();
    const walk = (n) => {
      m.set(n._id, n);
      (n.children || []).forEach(walk);
    };
    categories.forEach(walk);
    return m;
  }, [categories]);

  const roots = useMemo(() => categories.filter((c) => !c.parent), [categories]);

  const toggle = useCallback(
    (id) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    [setExpanded]
  );

  const expandAll = () => {
    const next = new Set();
    idToNode.forEach((v, k) => next.add(k));
    setExpanded(next);
  };
  const collapseAll = () => setExpanded(new Set());

  const go = (id) => {
    const params = new URLSearchParams(searchParams);
    params.set("deep", "1"); // keep deep mode
    navigate(`/c/${id}?${params.toString()}`);
  };

  // Filter logic (case-insensitive)
  const match = (label) => label.toLowerCase().includes(query.trim().toLowerCase());

  const Node = ({ node, level = 0 }) => {
    const children = node.children || [];
    const isOpen = expanded.has(node._id);
    const isActive = categoryId === node._id;

    // If searching, only show nodes that match or have descendants that match
    const childMatches = children
      .map((c) => ({ node: c, comp: <Node key={c._id} node={c} level={level + 1} /> }))
      .filter(({ node: c }) => {
        const stack = [c];
        while (stack.length) {
          const curr = stack.pop();
          if (match(curr.label)) return true;
          if (curr.children) stack.push(...curr.children);
        }
        return false;
      });

    const visible = query ? match(node.label) || childMatches.length > 0 : true;
    if (!visible) return null;

    return (
      <div className="select-none">
        <div className="flex items-center">
          {/* Caret / spacer */}
          <button
            type="button"
            onClick={() => toggle(node._id)}
            className={`mr-2 h-5 w-5 grid place-items-center border border-gray-300 text-[10px] leading-none ${
              children.length ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label={isOpen ? "Collapse" : "Expand"}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "–" : "+"}
          </button>

          {/* Label */}
          <button
            type="button"
            onClick={() => go(node._id)}
            className={`flex-1 text-left text-sm py-1 ${
              isActive ? "font-semibold text-black" : "text-gray-700 hover:text-black"
            }`}
            style={{ paddingLeft: level * 8 }}
          >
            {node.label}
          </button>
        </div>

        {/* Children */}
        {isOpen && childMatches.length > 0 && (
          <div className="ml-6 border-l border-gray-200 pl-3">
            {childMatches.map(({ comp }) => comp)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Categories</h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs underline text-gray-700 hover:text-black"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-xs underline text-gray-700 hover:text-black"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories"
          className="w-full border border-gray-300  px-3 py-1.5 text-sm focus:outline-none focus:ring-0 focus:border-black"
        />
      </div>

      {/* Tree */}
      <div className="space-y-1">
        {roots.map((r) => (
          <Node key={r._id} node={r} />
        ))}
      </div>

      {categoryId && deep && (
        <div className="mt-3 text-[11px] text-gray-500">Deep mode • includes descendants</div>
      )}
    </aside>
  );
}
