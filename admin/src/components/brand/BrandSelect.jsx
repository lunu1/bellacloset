import { useEffect, useMemo, useRef, useState } from "react";

/**
 * props:
 *  - brands: [{ _id, name, slug, logo? }]
 *  - valueId: string | null
 *  - onChange: (id|null) => void
 *  - onCreate: async (name) => ({ _id, name })
 *  - disabled?: boolean
 *  - placeholder?: string
 */
export default function BrandSelect({
  brands = [],
  valueId,
  onChange,
  onCreate,
  disabled = false,
  placeholder = "Select a brand",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // keyboard highlight
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(
    () => brands.find((b) => String(b._id) === String(valueId)) || null,
    [brands, valueId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name?.toLowerCase().includes(q));
  }, [brands, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return brands.find((b) => b.name?.toLowerCase() === q) || null;
  }, [brands, query]);

  // open dropdown when focusing the input
  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(-1);
  };

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // keep input showing the selected name when closed
  useEffect(() => {
    if (!open) {
      setQuery(selected?.name || "");
    }
  }, [open, selected]);

  // init query from selected
  useEffect(() => {
    setQuery(selected?.name || "");
  }, [selected?._id]); // eslint-disable-line

  function selectItem(b) {
    onChange?.(b?._id ?? null);
    setOpen(false);
    setQuery(b?.name || "");
  }

  async function createBrand(name) {
    if (!onCreate) return;
    try {
      setCreating(true);
      const created = await onCreate(name.trim());
      setCreating(false);
      if (created && created._id) {
        // add immediately
        selectItem(created);
      }
    } catch (e) {
      setCreating(false);
      console.error("Create brand failed:", e);
    }
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    const lastIndex = filtered.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < lastIndex ? i + 1 : lastIndex));
      scrollIntoView(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : 0));
      scrollIntoView(activeIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        selectItem(filtered[activeIndex]);
      } else if (!exactMatch && query.trim()) {
        createBrand(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function scrollIntoView(index) {
    // gentle auto-scroll for keyboard highlight
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-index="${index}"]`);
    if (!el) return;
    const { top, bottom } = el.getBoundingClientRect();
    const { top: lTop, bottom: lBottom } = list.getBoundingClientRect();
    if (top < lTop) list.scrollTop -= lTop - top + 4;
    else if (bottom > lBottom) list.scrollTop += bottom - lBottom + 4;
  }

  return (
    <div className="relative" ref={rootRef}>
      {/* Control (input + chevron) */}
      <div
        className={`flex items-center gap-2 border rounded px-3 py-2 bg-white ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
          openDropdown();
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onFocus={openDropdown}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={onKeyDown}
          className="flex-1 outline-none bg-transparent border-none"
          placeholder={placeholder}
          disabled={disabled}
        />
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow ">
          {/* Options */}
          <ul ref={listRef} className="max-h-60 overflow-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((b, idx) => {
                const active = idx === activeIndex;
                const selected = String(b._id) === String(valueId);
                return (
                  <li
                    key={b._id}
                    data-index={idx}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                      ${active ? "bg-blue-500" : "bg-white"}
                      ${selected ? "font-medium" : ""}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    onClick={() => selectItem(b)}
                  >
                    <span>{b.name}</span>
                    {selected && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 011.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 select-none">No brands</li>
            )}
          </ul>

          {/* Create new (shown when there’s no exact match + user typed something) */}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={() => createBrand(query)}
              disabled={creating}
              className="w-full text-left px-3 py-2 border-t text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              {creating ? "Adding…" : `Create “${query.trim()}”`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
