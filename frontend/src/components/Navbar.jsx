import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";

import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

import {
  setQuery,
  fetchSearchSuggestions,
  clearResults,
} from "../features/search/searchSlice";

import { getWishlist, clearWishlist } from "../features/wishlist/wishlistSlice";
import { loadCart, clearCart } from "../features/cart/cartSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Global state ---
  const search = useSelector((s) => s.search.query);
  const suggestions = useSelector((s) => s.search.suggestions);
  const wishlistCount = useSelector((s) => s.wishlist?.items?.length || 0);
  const cartlistCount = useSelector((s) => s.cart?.items?.length || 0);

  // --- Context ---
  const { userData, backendUrl, setisLoggedin, setuserData, authLoading } =
    useContext(AppContext);

  // --- Local UI state ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // click-based dropdown (better for touch)
  const drawerRef = useRef(null);

  // simple debounce timer for suggestions
  const debounceTimer = useRef(null);

  // Fetch wishlist & cart after auth loads
  useEffect(() => {
    if (!authLoading && userData) {
      dispatch(getWishlist());
      dispatch(loadCart());
    }
  }, [authLoading, userData, dispatch]);

  // Clear search suggestions when leaving search page
  useEffect(() => {
    if (!location.pathname.includes("/search")) {
      dispatch(clearResults());
    }
  }, [location.pathname, dispatch]);

  // Lock scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  // Close menus on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus the close button when drawer opens (a11y)
  useEffect(() => {
    if (mobileMenuOpen) {
      drawerRef.current
        ?.querySelector('button[aria-label="Close menu"]')
        ?.focus();
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/c?search=${encodeURIComponent(q)}`);
  };

  const queueSuggestions = (value) => {
    // debounce to reduce dispatch spam
    clearTimeout(debounceTimer.current);
    if (value.trim()) {
      debounceTimer.current = setTimeout(() => {
        dispatch(fetchSearchSuggestions(value));
      }, 200);
    } else {
      dispatch(clearResults());
    }
  };

  const handleSuggestionClick = (name) => {
    dispatch(setQuery(name));
    navigate(`/c?search=${encodeURIComponent(name)}`);
    dispatch(clearResults());
    setMobileSearchOpen(false);
  };

  const clearSearch = () => {
    dispatch(setQuery(""));
    dispatch(clearResults());
    navigate("/c");
  };

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setisLoggedin(false);
        setuserData(null);
        dispatch(clearWishlist());
        dispatch(clearCart());
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const SendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/send-otp`);
      if (data.success) {
        toast.success(data.message);
        navigate("/email-verify");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "Error sending OTP: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 sm:gap-5 py-3 sm:py-4">
          {/* Left: Logo + mobile menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu button */}
            <button
              aria-label="Open menu"
              className="sm:hidden p-2 -ml-2 rounded hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <img src={assets.menu_icon} className="w-6" alt="menu" />
            </button>

            <Link to="/" className="shrink-0" aria-label="Bella Closet home">
              <img
                src="/logo.png"
                alt="Bella Closet"
                className="block h-8 sm:h-10 w-auto max-w-[40vw] sm:max-w-[30vw] object-contain"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Center: Desktop search */}
          <div className="hidden sm:block flex-1 min-w-0 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="inline-flex items-center w-full px-4 py-2 border border-black rounded-md"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  dispatch(setQuery(v));
                  queueSuggestions(v);
                }}
                placeholder="What are you looking for?"
                className="flex-1 text-base outline-none bg-transparent"
                aria-label="Search products"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="p-1"
                >
                  <img src={assets.cross_icon} alt="clear" className="w-3" />
                </button>
              ) : null}
            </form>

            {/* Suggestions (desktop) */}
            {search && (
              <ul className="absolute z-40 bg-white border mt-1 rounded w-full max-h-60 overflow-y-auto no-scrollbar shadow">
                {suggestions.length > 0 ? (
                  suggestions.map((sugg, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                      onClick={() => handleSuggestionClick(sugg)}
                    >
                      {sugg}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-left text-gray-500 select-none">
                    No suggestions for “{search}”
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Right: Icons & profile */}
          <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
            {/* Mobile search toggle */}
            <button
              aria-label="Open search"
              className="sm:hidden rounded hover:bg-gray-100"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <img src={assets.search_icon} className="w-6" alt="search" />
            </button>

            {/* Username (desktop only) */}
            <span className="hidden sm:block">{userData?.name}</span>

            {/* Profile (click to open; touch-friendly) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Account menu"
              >
                <img
                  src={assets.profile_icon}
                  className="w-6 cursor-pointer"
                  alt="profile"
                />
              </button>
              {userData && profileOpen && (
                <div className="absolute right-0 pt-4 z-50">
                  <div className="flex flex-col gap-2 px-5 py-3 text-gray-700 rounded w-44 bg-white border shadow">
                    {!userData?.isAccountVerified && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          SendVerificationOtp();
                        }}
                        className="text-left hover:text-black"
                      >
                        Verify Email
                      </button>
                    )}
                    <Link
                      to="/profile"
                      className="hover:text-black"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="hover:text-black"
                      onClick={() => setProfileOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="text-left hover:text-black"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative"
              aria-label={`Wishlist${wishlistCount ? ` with ${wishlistCount} items` : ""}`}
            >
              <img src={assets.heart_icon} className="w-6 min-w-5" alt="wishlist" />
              {wishlistCount > 0 && (
                <p className="absolute right-0 -bottom-1 translate-x-1/2 w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[10px]">
                  {wishlistCount}
                </p>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative"
              aria-label={`Cart with ${cartlistCount} items`}
            >
              <img src={assets.cart_icon} className="w-6 min-w-5" alt="cart" />
              <p className="absolute right-0 -bottom-1 translate-x-1/2 w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[10px]">
                {cartlistCount}
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t">
          <div className="container mx-auto px-4 py-3 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 px-3 py-2 border border-black rounded-md"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  dispatch(setQuery(v));
                  queueSuggestions(v);
                }}
                placeholder="Search Bella Closet"
                className="flex-1 text-base outline-none bg-transparent"
                aria-label="Search products mobile"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="p-1"
                >
                  <img src={assets.cross_icon} alt="clear" className="w-3" />
                </button>
              ) : null}
            </form>

            {/* Suggestions (mobile) */}
            {search && (
              <ul className="absolute inset-x-0 mx-4 z-40 bg-white border mt-1 rounded max-h-60 overflow-y-auto shadow">
                {suggestions.length > 0 ? (
                  suggestions.map((sugg, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                      onClick={() => handleSuggestionClick(sugg)}
                    >
                      {sugg}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-left text-gray-500 select-none">
                    No suggestions for “{search}”
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] sm:hidden ${mobileMenuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <aside
          ref={drawerRef}
          className={`absolute left-0 top-0 h-full w-[78%] max-w-xs bg-white shadow-xl transition-transform
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img src={assets.profile_icon} className="w-6" alt="" />
              <div className="font-medium">
                {userData ? `Hi, ${userData.name}` : "Welcome"}
              </div>
            </div>
            <button
              aria-label="Close menu"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img src={assets.cross_icon} alt="close" className="w-3.5" />
            </button>
          </div>

          <nav className="p-4 flex flex-col gap-3 text-gray-800">
            {!userData ? (
              <Link
                to="/login"
                className="py-2 px-3 rounded border hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Sign up
              </Link>
            ) : (
              <>
                {!userData?.isAccountVerified && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      SendVerificationOtp();
                    }}
                    className="text-left py-2 px-3 rounded border hover:bg-gray-50"
                  >
                    Verify Email
                  </button>
                )}
                <Link
                  to="/profile"
                  className="py-2 px-3 rounded hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="py-2 px-3 rounded hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left py-2 px-3 rounded hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            )}

            <hr className="my-2" />

            <Link
              to="/wishlist"
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-black text-white px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Cart</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs rounded-full bg-black text-white px-1">
                {cartlistCount}
              </span>
            </Link>

            <Link
              to="/c"
              className="py-2 px-3 rounded hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Collection
            </Link>
          </nav>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;
