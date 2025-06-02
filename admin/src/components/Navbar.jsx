import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

function Navbar({ setToken }) {
  return (
    <div className="flex items-center justify-between px-[4%] py-2 bg-white">
<Link to="/">
        {/* <img src={assets.logo} className="w-36" alt="" /> */}
        <h1 className="bodoni-moda-heading text-2xl uppercase">Bella Closet</h1>

      </Link>      <button
        onClick={() => setToken("")}
        className="px-5 py-2 text-xs text-white bg-gray-600 rounded-full sm:px-7 sm:py-2 sm:text-sm"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;
