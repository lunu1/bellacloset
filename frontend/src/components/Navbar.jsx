import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
// import { MenuItem } from "@mui/material";
// import SearchBox from "./SearchBox";


const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount ,search, setSearch, showSearch,} = useContext(ShopContext);
 
  let navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.includes("collection")) {
      setShowSearch(false);
    } else {
      setShowSearch(true);
    }
  }, [location]);

  const { userData, backendUrl, setisLoggedin, setuserData } =
    useContext(AppContext);

  // const handleLogout = async () => {
  //   try {
  //     axios.defaults.withCredentials = true;
  //     const { data } = await axios.post(backendUrl + "/api/auth/logout");
  //     data.success && setisLoggedin(false);
  //     data.success && setuserData(false);
  //     navigate("/");
  //     toast.success(data.message);
  //   } catch (error) {
  //     toast.error("Error signing out: " + error.message);
  //   }
  // };


  const handleLogout = async () => {
  try {
    axios.defaults.withCredentials = true;
    const { data } = await axios.post(backendUrl + "/api/auth/logout");

    if (data.success) {
      setisLoggedin(false);
      setuserData(false);
      navigate("/");
      toast.success(data.message);  // ✅ Will show message like "User logged out"
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
      toast.error("Error sending OTP: ", error.data.message);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-between py-10 font-medium">
      <Link to="/">
        {/* <img src={assets.logo} className="w-36" alt="" /> */}
        <h1 className="bodoni-moda-heading text-2xl uppercase">Bella Closet</h1>

      </Link>
      {/* <ul className="hidden gap-5 text-gray-700 sm:flex">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[2px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[2px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[2px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>

          <hr className="w-2/4 border-none h-[2px] bg-gray-700 hidden" />
        </NavLink>
      </ul> */}

      {/* Search Bar which i took code from search box */}
      <div className="text-center w-[48vw]">
      <div className="inline-flex items-center justify-center w-full px-5 py-2 mx-3 my-5 border border-black rounded-md  sm:w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="What are you looking for?"
          className="flex-1 text-md outline-none bg-inherit"
        />
        <img
          src={assets.cross_icon}
          alt=""
          className="inline w-3 cursor-pointer"
          onClick={(e) => {
            setShowSearch(false);
          }}
        />
      </div>
    </div>
 <div className="flex items-center gap-6">
        {/* <img
          src={assets.search_icon}
          onClick={() => {
            if (!location.pathname.includes("collection")) {
              navigate("/collection");
              setShowSearch(true);
            } else {
              setShowSearch(true);
            }
          }}
          className="w-6 cursor-pointer"
          alt=""
        /> */}
        <h1>{userData?.name}</h1>

        <div className="relative group">
          {/* {useState ? ( <Link to={"/profile"}>
            <img
              src={assets.profile_icon}
              className="w-6 cursor-pointer"
              alt=""
            />
          </Link>) : ( <Link to={"/login"}>
            <img
              src={assets.profile_icon}
              className="w-6 cursor-pointer"
              alt=""
            />
          </Link>)} */}

          <Link to={userData ? "" : "/login"}>
            <img
              src={assets.profile_icon}
              className="w-6 cursor-pointer"
              alt=""
            />
          </Link>
           {userData && (
            <div className="absolute right-0 hidden pt-4 group-hover:block dropdown-menu z-10">
              <div className="flex flex-col gap-2 px-5 py-3 text-gray-500 rounded w-36 bg-slate-100 ">
                <p> {!userData?.isAccountVerified ? (
                  <button onClick={SendVerificationOtp}>
                    <Link
                      sx={{ display: "flex", gap: "16px" }}
                      to="/email-verify"
                      className="cursor-pointer hover:text-gray-700"
                     
                    >
                      {" "}
                      {/* handleClose*/}
                      {/* <svg
                        width="32"
                        height="32"
                        className="h-28 w-28"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 8L16 16L28 8"
                          stroke="#FAFAFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 8V24C4 25.1046 4.89543 26 6 26H26C27.1046 26 28 25.1046 28 24V8"
                          stroke="#FAFAFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg> */}
                      {/* {i18n.t("headerIcons.1")} */}
                      Verify Email
                    </Link>
                  </button>
                ) : (
                  ""
                )}</p>
                <Link to="/profile" className="cursor-pointer hover:text-gray-700">My Profile</Link>
                <p className="cursor-pointer hover:text-gray-700">Orders</p>
                {userData ? (
                  <p
                    onClick={handleLogout}
                    className="cursor-pointer hover:text-gray-700"
                  >
                    Logout
                  </p>
                ) : (
                  <p className="cursor-pointer hover:text-gray-700">Login</p>
                )}

               
              </div>
            </div>
          )}
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-6 min-w-5" alt="" />
          <p className="absolute right-[-7px] bottom-[-7px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          onClick={() => {
            setVisible(true);
          }}
          src={assets.menu_icon}
          className="w-6 cursor-pointer sm:hidden"
          alt=""
        />
      </div>


      {/* Sidebar menu for small screens */}

  
    </div>
  );
};

export default Navbar;