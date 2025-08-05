// context/AdminContext.js
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { backendURL } from "../config";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin data
  const getAdminData = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/admin/data`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setAdminData(res.data.admin);
        setIsAdminLoggedIn(true);
      }
    } catch (error) {
      setIsAdminLoggedIn(false);
      setAdminData(null);
    }
  };

  // Check login on load
  const checkAdminAuth = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/admin/is-auth`, {
        withCredentials: true,
      });
       if (res.status === 200) {
        await getAdminData();
      }
    } catch (error) {
      setIsAdminLoggedIn(false);
      setAdminData(null);
    } finally {
      setLoading(false); //  Finish loading after check
    }
  };
  useEffect(() => {
    checkAdminAuth(); // run once when app loads
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        adminData,
        setAdminData,
        getAdminData,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
