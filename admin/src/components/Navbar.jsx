import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../config"; // make sure this is correct
import { toast } from "react-toastify";


function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await axios.post(`${backendURL}/api/admin/logout`, {}, { withCredentials: true });

      toast.success("Logged out successfully");
      // Cookies.remove("token")
      setToken(""); 
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="flex items-center justify-between px-[4%] py-2 bg-white">
      <Link to="/">
        <h1 className="bodoni-moda-heading text-2xl uppercase">Bella Closet</h1>
      </Link>
   
   {token ? (
      <button
        onClick={handleLogout}
        className="px-5 py-2 text-xs text-white bg-gray-600 rounded-full sm:px-7 sm:py-2 sm:text-sm"
      >
        Logout
      </button>
      ): (
        <button
        onClick={() => navigate("/login")}
        className="px-5 py-2 text-xs text-white bg-gray-600 rounded-full sm:px-7 sm:py-2 sm:text-sm"
      >
        Login
        </button>
      )}
    </div>
  );
}

export default Navbar;