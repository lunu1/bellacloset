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



  // const getUserData = async () => {
  //   try {
  //     const { data } = await axios.get(backendUrl + "/api/user/data", {
  //       withCredentials: true, // Ensure credentials (cookies) are included
  //     });
  //     data.success ? setuserData(data.userData) : toast.error(data.message);
  //   //   console.log(userData)
  //   } catch (error) {
  //     toast.error(error.data.message);
  //   }
  // };


  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });

      if (data.success) {
        setuserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };





  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setisLoggedin(true);
        await getUserData();
      }
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  useEffect ( ()=>{
     getAuthState();
  }, [])

  const value = {
    backendUrl,
    isLoggedin,
    setisLoggedin,
    userData,
    setuserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Add PropTypes validation
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensure children is a valid React node
};