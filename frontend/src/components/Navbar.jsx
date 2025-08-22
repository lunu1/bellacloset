import { useContext, useState, useEffect } from "react";
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

// ✅ import wishlist + cart actions
import { getWishlist, clearWishlist } from "../features/wishlist/wishlistSlice";
import { clearCart } from "../features/cart/cartSlice";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const search = useSelector((s) => s.search.query);
  const suggestions = useSelector((s) => s.search.suggestions);

  const { userData, backendUrl, setisLoggedin, setuserData, authLoading } =
    useContext(AppContext);


    //fetch wishlist count
  useEffect(() => {
    if(!authLoading && userData) {
      dispatch(getWishlist());
    }
  }, [authLoading, userData, dispatch]);

  
  const location = useLocation();
  const navigate = useNavigate();

  const wishlistCount = useSelector((s) => s.wishlist?.items?.length || 0);
  const cartlistCount = useSelector((s) => s.cart?.items?.length || 0);

  // Clear search suggestions when leaving /search
  useEffect(() => {
    if (!location.pathname.includes("/search")) {
      dispatch(clearResults());
    }
  }, [location.pathname, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // if you have a virtual "all" category ID you can use it here
      // or just point to `/c/rootId`
      navigate(`/c?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSuggestionClick = (name) => {
    dispatch(setQuery(name));
    navigate(`/c?search=${encodeURIComponent(name)}`);
    dispatch(clearResults());
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
    <div className="container mx-auto flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <h1 className="bodoni-moda-heading text-2xl uppercase">Bella Closet</h1>
      </Link>

      {/* Search */}
      <div className="text-center w-[48vw] relative">
        <form
          onSubmit={handleSearch}
          className="inline-flex items-center justify-center w-full px-5 py-2 mx-3 my-5 border border-black rounded-md sm:w-full"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              dispatch(setQuery(v));
              if (v.trim()) dispatch(fetchSearchSuggestions(v));
              else dispatch(clearResults());
            }}
            placeholder="What are you looking for?"
            className="flex-1 text-md outline-none bg-inherit"
          />
          <img
            src={assets.cross_icon}
            alt="clear"
            className="inline w-3 cursor-pointer"
            onClick={() => {
              dispatch(setQuery(""));
              navigate("/c"); // optional: drop the ?search param too
              dispatch(clearResults());
            }}
          />
        </form>

        {search && (
          <ul className="absolute z-50 bg-white border mt-1 rounded w-full max-h-60 overflow-y-auto shadow">
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

      {/* Right side */}
      <div className="flex items-center gap-6">
        <h1>{userData?.name}</h1>

        {/* Profile */}
        <div className="relative group">
          <Link to={userData ? "" : "/login"}>
            <img
              src={assets.profile_icon}
              className="w-6 cursor-pointer"
              alt="profile"
            />
          </Link>
          {userData && (
            <div className="absolute right-0 pt-4 hidden group-hover:block dropdown-menu z-10">
              <div className="flex flex-col gap-2 px-5 py-3 text-gray-500 rounded w-36 bg-slate-100">
                {!userData?.isAccountVerified && (
                  <Link
                    to="/email-verify"
                    onClick={SendVerificationOtp}
                    className="cursor-pointer hover:text-gray-700 px-0"
                  >
                    Verify Email
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="cursor-pointer hover:text-gray-700"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="cursor-pointer hover:text-gray-700"
                >
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer hover:text-gray-700 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist */}
        <Link to="/wishlist" className="relative">
          <img src={assets.heart_icon} className="w-6 min-w-5" alt="wishlist" />
          {wishlistCount > 0 && (
            <p className="absolute right-[-7px] bottom-[-7px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {wishlistCount}
            </p>
          )}
        </Link>

        {/* Cart */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-6 min-w-5" alt="cart" />
          <p className="absolute right-[-7px] bottom-[-7px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {cartlistCount}
          </p>
        </Link>

        {/* Mobile Menu */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-6 cursor-pointer sm:hidden"
          alt="menu"
        />
      </div>
    </div>
  );
};

export default Navbar;
