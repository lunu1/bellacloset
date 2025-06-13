import axios from "axios";
import { useState } from "react";
import { backendURL } from "../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";// Import Cookies

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()

  // Login
  const onSubmitHandler = async (e) => {
     e.preventDefault();
    try {
     
      const response = await axios.post(`${backendURL}/api/admin/login`, {
        email,
        password,
      });
       console.log("Response:", response.data); 
    if (response.data.token)
 {       
         
         toast.success(response.data.message);
         Cookies.set("token", response.data.token);// Set the token in a cookie
         setToken(response.data.token);// Update the token state
         navigate('/')//  Redirect to the home page
        
       
      } else {
       
        toast.error(response.data.message);
      }
    } catch (error) {
  console.error("Login error:", error);
  toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
}

  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="max-w-md px-8 py-6 mb-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
        <form action="" onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Email Address
            </p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              type="email"
              placeholder="your@email.com"
              value={email}
              required
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="mb-2 text-sm font-medium text-gray-700">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              type="password"
              placeholder="Enter your password"
              value={password}
              required
            />
          </div>
          <button
            className="w-full px-4 py-2 mt-2 text-white bg-black rounded-md"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;