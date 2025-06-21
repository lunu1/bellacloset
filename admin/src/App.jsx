import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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

// 🆕 Product Management
import AddProduct from "../../admin/src/pages/AddProduct";          
import Products from "./pages/productlisting";

//import ProductList from "./pages/ProductList";      

import Cookies from "js-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export let currency = "PKR. ";

const App = () => {
  const [token, setToken] = useState(Cookies.get("token") || "");
  const isAuthenticated = !!token;

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
            <Route path="/login" element={<Login setToken={setToken} />} />

            {isAuthenticated ? (
              <>
                <Route path="/" element={<Admin />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/banner" element={<Banner token={token} />} />
                <Route path="/category" element={<Category token={token} />} />
                <Route path="/users" element={<UserList token={token} />} />

                {/* 🆕 Product Routes */}
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products" element={<Products />} />
                
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
