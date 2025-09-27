import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../features/category/categorySlice";

export default function DesignerNavbar() {
  const [activeCategory, setActiveCategory] = useState(null); // desktop hover index
  const [mobileOpen, setMobileOpen] = useState(false);        // mobile drawer
  const [openParent, setOpenParent] = useState(null);         // mobile accordion: parent id
  const [openChild, setOpenChild] = useState(null);           // mobile accordion: subcat id

  const rowRef = useRef(null);                                 // NEW: desktop scroll row
  const [showLeft, setShowLeft] = useState(false);             // NEW: show/hide left arrow
  const [showRight, setShowRight] = useState(false);           // NEW: show/hide right arrow

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: navbarData = [], loading, error } = useSelector((s) => s.category);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // lock body scroll when drawer open
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; }, [mobileOpen]);

  // close drawer / mega on ESC
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setActiveCategory(null);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const handleMouseEnter = (i) => setActiveCategory(i);
  const handleMouseLeave = () => setActiveCategory(null);

  const goToCategory = useCallback(
    (id) => {
      if (!id) return;
      navigate(`/c/${id}?deep=1`);
      setActiveCategory(null);
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [navigate]
  );

  // mobile accordion toggles
  const toggleParent = (id) => { setOpenChild(null); setOpenParent((p) => (p === id ? null : id)); };
  const toggleChild = (id) => setOpenChild((p) => (p === id ? null : id));

  // --- Desktop scroll helpers ---
  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = rowRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    const id = setTimeout(updateArrows, 0); // after first paint/data load
    return () => {
      clearTimeout(id);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [navbarData.length, updateArrows]);

  const scrollByAmount = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8); // scroll ~80% viewport
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <header className="w-full font-sans bg-white sticky top-0 z-20">
      {/* MOBILE: hamburger + centered SHOP */}
      <div className="md:hidden container mx-auto px-3">
        <div className="grid grid-cols-3 items-center py-3">
          <div className="justify-self-start">
            <button
              type="button"
              aria-label="Open menu"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
          <div className="justify-self-center">
            <span className="text-lg font-semibold tracking-wide uppercase">Shop</span>
          </div>
          <div className="justify-self-end w-9 h-9" />
        </div>
      </div>

      {/* DESKTOP: single-row scroller with arrows + hover mega menu */}
      <nav className="hidden md:block bg-white relative">
        <div className="container mx-auto  relative">
          {/* arrows */}
          {showLeft && (
            <button
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white border border-gray-300 shadow hover:border-black"
              onClick={() =>  showLeft && scrollByAmount(-1)}
            >
              ‹
            </button>
          )}
          {showRight && (
            <button
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white border border-gray-300 shadow hover:border-black"
              onClick={() => scrollByAmount(1)}
            >
              ›
            </button>
          )}

          {/* single-line scroll row */}
          <div
            ref={rowRef}
            className="flex flex-nowrap items-center gap-x-4 py-2 overflow-x-auto no-scrollbar "
            // style={{ scrollbarWidth: "thin" }} // Firefox thin scrollbar
            onMouseLeave={handleMouseLeave}
          >
            {loading && <div className="px-2 py-2">Loading...</div>}
            {error && <div className="px-2 py-2 text-red-500">Error loading categories</div>}
            {!loading &&
              navbarData.map((category, index) => (
                <div
                  key={category._id || index}
                  className="relative shrink-0"
                  onMouseEnter={() => setActiveCategory(index)}
                >
                  <button
                    type="button"
                    className="px-2 py-3 text-md tracking-wide hover:font-bold uppercase whitespace-nowrap text-start"
                    onClick={() => goToCategory(category._id)}
                  >
                    {category.label}
                  </button>
                </div>
              ))}
          </div>

          {/* hover mega menu */}
          {activeCategory !== null &&
            navbarData[activeCategory]?.children?.length > 0 && (
              <div
                className="absolute left-0 right-0 z-50 bg-white shadow-lg border-t"
                onMouseEnter={() => setActiveCategory(activeCategory)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="container mx-auto px-3">
                  <div className="flex flex-wrap p-6 gap-6">
                    {navbarData[activeCategory].children.map((subcategory) => (
                      <div key={subcategory._id} className="w-full md:w-1/4 px-2">
                        <button
                          type="button"
                          className="font-bold mb-3 text-black uppercase hover:underline"
                          onClick={() => goToCategory(subcategory._id)}
                        >
                          {subcategory.label}
                        </button>
                        <ul className="uppercase text-sm space-y-2">
                          {(subcategory.children || []).map((item) => (
                            <li key={item._id}>
                              <button
                                type="button"
                                className="hover:font-bold"
                                onClick={() => goToCategory(item._id)}
                              >
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </nav>

      {/* MOBILE drawer with options */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-base font-semibold uppercase">Browse</span>
            <button
              aria-label="Close menu"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* accordion list */}
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {loading && <div className="p-4 text-sm">Loading...</div>}
            {error && <div className="p-4 text-sm text-red-500">Error loading categories</div>}
            {!loading && navbarData.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No categories</div>
            )}

            <ul className="divide-y">
              {navbarData.map((cat) => {
                const isOpen = openParent === cat._id;
                return (
                  <li key={cat._id}>
                    {/* Parent */}
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left uppercase font-medium"
                      aria-expanded={isOpen}
                      onClick={() => toggleParent(cat._id)}
                    >
                      <span>{cat.label}</span>
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Parent panel */}
                    <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : ""}`}>
                      <div className="overflow-hidden">
                        <div className="px-4 pb-3">
                          <button className="text-sm underline underline-offset-2" onClick={() => goToCategory(cat._id)}>
                            Shop all {cat.label}
                          </button>
                        </div>

                        {/* Subcategories */}
                        <ul className="pb-2">
                          {(cat.children || []).map((sub) => {
                            const subOpen = openChild === sub._id;
                            return (
                              <li key={sub._id} className="border-t">
                                <button
                                  className="w-full flex items-center justify-between px-6 py-3 text-left uppercase text-sm font-semibold"
                                  aria-expanded={subOpen}
                                  onClick={() => toggleChild(sub._id)}
                                >
                                  <span>{sub.label}</span>
                                  <svg className={`w-4 h-4 transition-transform ${subOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                                  </svg>
                                </button>

                                {/* Subcategory panel */}
                                <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ${subOpen ? "grid-rows-[1fr]" : ""}`}>
                                  <div className="overflow-hidden">
                                    <div className="px-6 pb-3">
                                      <button className="text-xs underline underline-offset-2" onClick={() => goToCategory(sub._id)}>
                                        View all {sub.label}
                                      </button>
                                    </div>

                                    <ul className="pl-8 pr-4 pb-4 space-y-2">
                                      {(sub.children || []).map((item) => (
                                        <li key={item._id}>
                                          <button className="uppercase text-xs hover:font-bold" onClick={() => goToCategory(item._id)}>
                                            {item.label}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </header>
  );
}
