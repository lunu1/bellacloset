import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
import CouponCreation from "./pages/CouponCreation";
import AddProduct from "./pages/AddProduct";
import Products from "./pages/admin/ProductList";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdminContext } from "./context/AdminContext";
import ProductEdit from "./pages/admin/ProductEdit";
import SettingsPage from "./pages/SettingPage";
import Offer from "./pages/Offer";

export let currency = "AED. ";

const App = () => {
  const { isAdminLoggedIn, loading } = useContext(AdminContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <Navbar />
      <hr />

      <div className="flex w-full">
        {isAdminLoggedIn && <Sidebar />}

        <div
          className={`${
            isAdminLoggedIn ? "w-[70%] ml-[max(5vw, 25px)]" : "w-full"
          } mx-auto my-8 text-gray-800 text-base`}
        >
          <Routes>
            {isAdminLoggedIn ? (
              <>
                <Route path="/" element={<Admin />} />
                <Route path="/add" element={<Add />} />
                <Route path="/list" element={<List />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/banner" element={<Banner />} />
                <Route path="/category" element={<Category />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/coupons" element={<CouponCreation />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/settings" element={<SettingsPage/>} />
                <Route path="/offer" element={<Offer/>} />
                <Route path="*" element={<Navigate to="/" />} />

                <Route
                  path="/admin/products/edit/:id"
                  element={<ProductEdit />}
                />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
