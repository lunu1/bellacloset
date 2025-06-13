import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Banner from "./pages/Banner";
import Category from "./pages/Category";
import UserList from "./pages/UserList";
import Login from "./components/Login";
import Admin from "./pages/Admin";
import Cookies from "js-cookie";

// export let backendURL = import.meta.env.VITE_BACKEND_URL;
export let currency = "PKR. ";

const App = () => {
  const [token, setToken] = useState(Cookies.get("token") || "");// Get the token from the cookie

  // useEffect(() => {
  //   localStorage.setItem("token", token);
  // }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <> */}
      {/* <Navbar setToken={setToken} /> */}

      {/* receives the token as a prop */}
      <Navbar token={token} setToken={setToken} />
      <hr />
      <div className="flex w-full">
        {token  && <Sidebar />}{/* Only show Sidebar if token exists */}

       {/* Adjust width and margin: 70% with sidebar, full width without sidebar */}
        <div
            className={`${
              token ? "w-[70%] ml-[max(5vw, 25px)]" : "w-full"
            } mx-auto my-8 text-gray-800 text-base`}
          >
          <Routes>
            <Route path="/" element= { <Admin />}></Route>
            <Route path="/add" element={<Add token={token} />}></Route>
            <Route path="/list" element={<List token={token} />}></Route>
            <Route path="/orders" element={<Orders token={token} />}></Route>
            <Route path="/banner" element={<Banner token={token} />}></Route>
            <Route path="/category" element={<Category token={token} />}></Route>
            <Route path="/users" element= { <UserList token={token} />}></Route>
            <Route path="/login" element={<Login setToken={setToken} />}></Route>
          </Routes>
        </div>
      </div>
      {/* </>
      )} */}
    </div>
  );
};

export default App;
