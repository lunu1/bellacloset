import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { fetchCategories } from "../features/category/categorySlice";

export default function MegaNavbar() {
  const [activeCategory, setActiveCategory] = useState(null); // desktop hover index
  const [mobileOpen, setMobileOpen] = useState(false);        // mobile drawer
  const [openParent, setOpenParent] = useState(null);         // mobile accordion: parent id
  const [openChild, setOpenChild] = useState(null);           // mobile accordion: subcat id

  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: navbarData = [], loading, error } = useSelector((s) => s.category);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  // Close on ESC
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

  // If categories refresh or become empty, close the mega menu
  useEffect(() => {
    if (!navbarData?.length) setActiveCategory(null);
  }, [navbarData?.length]);

  const handleMouseLeave = () => setActiveCategory(null);

  const goToCategory = useCallback((id) => {
    if (!id) return;
    navigate(`/c/${id}?deep=1`);
    setActiveCategory(null);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [navigate]);

  const toggleParent = (id) => { setOpenChild(null); setOpenParent((p) => (p === id ? null : id)); };
  const toggleChild  = (id) => setOpenChild((p) => (p === id ? null : id));

  // Desktop scroll helpers
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
    const id = setTimeout(updateArrows, 0);
    return () => {
      clearTimeout(id);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [navbarData.length, updateArrows]);

  const scrollByAmount = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // -------- Mobile Drawer (rendered in a portal) --------
  const mobileDrawer = (
    <div
      className={`fixed inset-0 md:hidden ${mobileOpen ? "" : "pointer-events-none"} z-[99999]`}
      aria-hidden={!mobileOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
                    transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    overflow-y-auto will-change-transform relative
                    pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Floating close */}
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-10 p-2 rounded-full bg-white/95 shadow text-gray-900 hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {/* Sticky header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white text-gray-900">
          <span className="text-base font-semibold uppercase">Browse</span>
          <button
            aria-label="Close menu"
            className="p-2 rounded hover:bg-gray-100 text-gray-900"
            onClick={() => setMobileOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Accordion list */}
        <div className="px-0">
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
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>

                  {/* Parent panel */}
                  <div
                    className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : ""
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-3">
                        <button
                          className="text-sm underline underline-offset-2"
                          onClick={() => goToCategory(cat._id)}
                        >
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
                                <svg
                                  className={`w-4 h-4 transition-transform ${subOpen ? "rotate-180" : ""}`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              </button>

                              {/* Subcategory panel */}
                              <div
                                className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ${
                                  subOpen ? "grid-rows-[1fr]" : ""
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-6 pb-3">
                                    <button
                                      className="text-xs underline underline-offset-2"
                                      onClick={() => goToCategory(sub._id)}
                                    >
                                      View all {sub.label}
                                    </button>
                                  </div>

                                  <ul className="pl-8 pr-4 pb-4 space-y-2">
                                    {(sub.children || []).map((item) => (
                                      <li key={item._id}>
                                        <button
                                          className="uppercase text-xs hover:font-bold"
                                          onClick={() => goToCategory(item._id)}
                                        >
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
  );

  return (
    <header className="w-full font-sans bg-white sticky top-0 z-20">
      {/* MOBILE header */}
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
        <div className="container mx-auto relative" onMouseLeave={handleMouseLeave}>
          {/* arrows */}
          {showLeft && (
            <button
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white border border-gray-300 shadow hover:border-black"
              onClick={() => scrollByAmount(-1)}
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

          {/* scroller */}
          <div ref={rowRef} className="w-full overflow-x-auto no-scrollbar px-12 py-2">
            <div className="w-max mx-auto flex flex-nowrap items-center gap-x-4">
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
                      title={category.label}
                    >
                      {category.label}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* hover mega menu */}
          {activeCategory !== null &&
            Array.isArray(navbarData[activeCategory]?.children) &&
            navbarData[activeCategory].children.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full z-50 bg-white shadow-lg border-t"
                onMouseEnter={() => setActiveCategory(activeCategory)} // keep open when moving mouse into panel
              >
                <div className="container mx-auto px-3">
                  <div className="flex flex-wrap p-6 gap-6">
                    {navbarData[activeCategory].children.map((subcategory) => (
                      <div key={subcategory._id} className="w-full md:w-1/4 px-2">
                        <button
                          type="button"
                          className="font-semibold mb-3 text-black uppercase hover:underline"
                          onClick={() => goToCategory(subcategory._id)}
                        >
                          {subcategory.label}
                        </button>
                        <ul className="uppercase text-sm space-y-2">
                          {(subcategory.children || []).map((item) => (
                            <li key={item._id}>
                              <button
                                type="button"
                                className="hover:font-"
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

      {/* Render mobile drawer at document.body level */}
      {createPortal(mobileDrawer, document.body)}
    </header>
  );
}
