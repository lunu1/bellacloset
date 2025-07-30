import { useEffect, useState } from "react";
import { Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Admin from "./pages/Admin";
import Login from "./components/Login";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Banner from "./pages/Banner";
import Category from "./pages/Category";
import UserList from "./pages/UserList";



// import Cookies from "js-cookie";
import CouponCreation from "./pages/CouponCreation";


// 🆕 Product Management
import AddProduct from "../../admin/src/pages/AddProduct";          
import Products from "./pages/productlisting";

//import ProductList from "./pages/ProductList";      

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendURL } from "./config";
import axios from "axios";

export let currency = "PKR. ";

const App = () => {
  // const [token, setToken] = useState(Cookies.get("token") || "");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token;

  useEffect(() => {
  const checkAuth = async () => {
    try {
      await axios.get(`${backendURL}/api/admin/verify`, {
        withCredentials: true
      });
      setToken("verified"); // just a dummy non-empty value
    } catch (err) {
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);





  // ✅ Prevent rendering until auth check finishes
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Checking authentication...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <Navbar token={token} setToken={setToken} />
      <hr />

      <div className="flex w-full">
        {isAuthenticated && <Sidebar />}

        <div
          className={`${
            isAuthenticated ? "w-[70%] ml-[max(5vw, 25px)]" : "w-full"
          } mx-auto my-8 text-gray-800 text-base`}
        >
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Admin />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/banner" element={<Banner token={token} />} />
                <Route path="/category" element={<Category token={token} />} />
                <Route path="/users" element={<UserList token={token} />} />
                <Route path="/login" element={<Login setToken={setToken} /> }></Route>
                <Route path="/coupons" element={<CouponCreation />}></Route>
                {/* <Route path="/login" element={<Login setToken={setToken} />} /> */}

                {/* 🆕 Product Routes */}
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products" element={<Products />} />
                
              </>
            ) : (
              <Route path="/login" element={<Login setToken={setToken} />} />
              // <Route path="/login" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;