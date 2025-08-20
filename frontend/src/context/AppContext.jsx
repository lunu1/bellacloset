import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setisLoggedin] = useState(false);
  const [userData, setuserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ add this

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });
      if (data.success) {
        setuserData(data.userData);
      } else {
        // optional toast; avoid spamming on every load
        // toast.error(data.message);
        setuserData(null);
      }
    } catch (error) {
      // optional toast; keep logs quiet on boot
      // toast.error(error.response?.data?.message || "Failed to fetch user data");
      setuserData(null);
    }
  };

  const getAuthState = async () => {
    setAuthLoading(true); // ✅ start loading before network
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth", {
        withCredentials: true,
      });
      if (data.success) {
        setisLoggedin(true);
        await getUserData();
      } else {
        setisLoggedin(false);
        setuserData(null);
      }
    } catch (error) {
      setisLoggedin(false);
      setuserData(null);
      // don’t use error.data; it’s usually error.response.data
      // toast.error(error.response?.data?.message || "Auth check failed");
    } finally {
      setAuthLoading(false); // ✅ stop loading no matter what
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setisLoggedin,
    userData,
    setuserData,
    getUserData,
    authLoading,            // ✅ provide it
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
