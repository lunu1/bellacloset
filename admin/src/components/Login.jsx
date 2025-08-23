import axios from "axios";
import { useContext, useState } from "react";
import { backendURL } from "../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setIsAdminLoggedIn, getAdminData } = useContext(AdminContext);

  const onSubmitHandler = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${backendURL}/api/admin/login`,
      { email, password },
      { withCredentials: true } //  Send and receive cookies
    );

    if (response.data.success) {
      toast.success(response.data.message);
      setIsAdminLoggedIn(true);
      navigate("/");
      getAdminData();
      
    } else {
      toast.error(response.data.message || "Login failed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="flex items-center justify-center h-full pt-20">
      <div className="max-w-md px-8 py-6 mb-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
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
