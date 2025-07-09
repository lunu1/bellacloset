import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, search, setSearch, showSearch } = useContext(ShopContext);
  const { userData, backendUrl, setisLoggedin, setuserData } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const cartlistCount = useSelector((state) => state.cart?.items?.length || 0);


  useEffect(() => {
    if (!location.pathname.includes("collection")) {
      setShowSearch(false);
    } else {
      setShowSearch(true);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");

      if (data.success) {
        setisLoggedin(false);
        setuserData(null);
        navigate("/");
       console.log("✅ User logged out:", data.message); 
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
      const { data } = await axios.post(backendUrl + "/api/auth/send-otp");

      if (data.success) {
        toast.success(data.message);
        navigate("/email-verify");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error sending OTP: " + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-between py-10 font-medium">
      <Link to="/">
        <h1 className="bodoni-moda-heading text-2xl uppercase">Bella Closet</h1>
      </Link>

      {/* Search Bar */}
      <div className="text-center w-[48vw]">
        <div className="inline-flex items-center justify-center w-full px-5 py-2 mx-3 my-5 border border-black rounded-md sm:w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What are you looking for?"
            className="flex-1 text-md outline-none bg-inherit"
          />
          <img
            src={assets.cross_icon}
            alt=""
            className="inline w-3 cursor-pointer"
            onClick={() => setShowSearch(false)}
          />
        </div>
      </div>

      {/* Right Side: Profile, Cart, Menu */}
      <div className="flex items-center gap-6">
        <h1>{userData?.name}</h1>

        {/* Profile Icon */}
        <div className="relative group">
          <Link to={userData ? "" : "/login"}>
            <img src={assets.profile_icon} className="w-6 cursor-pointer" alt="" />
          </Link>

          {/* Dropdown Menu */}
          
          {userData && (
            <div className="absolute right-0 pt-4 hidden group-hover:block dropdown-menu z-10">
              <div className="flex flex-col gap-2 px-5 py-3 text-gray-500 rounded w-36 bg-slate-100">
                {!userData?.isAccountVerified && (
                  <button onClick={SendVerificationOtp}>
                    <Link to="/email-verify" className="cursor-pointer hover:text-gray-700">
                      Verify Email
                    </Link>
                  </button>
                )}
                <Link to="/profile" className="cursor-pointer hover:text-gray-700">
                  My Profile
                </Link>
                <Link to="/orders" className="cursor-pointer hover:text-gray-700">Orders</Link>
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

        {/* Wishlist Icon */}
        <Link to="/wishlist" className="relative">
          <img src={assets.heart_icon} className="w-6 min-w-5" alt="wishlist" />
          {/* Optional: Wishlist count badge */}
            {wishlistCount > 0 && (
              <p className="absolute right-[-7px] bottom-[-7px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {wishlistCount}
              </p>
            )}
          </Link>
          

        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-6 min-w-5" alt="cart" />
          <p className="absolute right-[-7px] bottom-[-7px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {cartlistCount}
          </p>
        </Link>

        {/* Mobile Menu Icon */}
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
