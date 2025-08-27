import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {

const base =  "flex items-center gap-3 px-3 py-2 border border-r-0 rounded-l transition-colors";
const idle = "border-gray-300 hover:bg-gray-50";
const active =
  "bg-[#d3c6cc] border-black font-medium";

  const linkCls = ({isActive}) => `${base} ${isActive ? active : idle}`

  return (
    <div className="min-h-screen border-r-2 w-[18%]">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        {/* <NavLink
          to={"/add"}
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-500 rounded-l"
        >
          <img src={assets.add_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Add Items</p>
        </NavLink> */}
        <NavLink
          to={"/products"}
          end
          className={linkCls}
        >
          <img src={assets.item_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">List Items</p>
        </NavLink>
        <NavLink
          to={"/orders"}
          end
          className={linkCls}
        >
          <img src={assets.order_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
        <NavLink
          to={"/banner"}
          end
          className={linkCls}
        >
          <img src={assets.order_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Update Banner</p>
        </NavLink>
        <NavLink
          to={"/category"}
          end
          className={linkCls}
        >
          <img src={assets.add_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Add Category</p>
        </NavLink>
        <NavLink
          to={"/users"}
          end
          className={linkCls}
        >
          <img src={assets.user_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">List User</p>
        </NavLink>
         <NavLink
          to={"/coupons"}
          end
          className={linkCls}
        >
          <img src={assets.coupon_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Add Coupon</p>
          </NavLink>
        <NavLink
          to={"/products/add"}
          end
          className={linkCls}
        >
          <img src={assets.order_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Add Product</p> 
        </NavLink>
        <NavLink to={"/settings"} end className={linkCls}>
          <img src={assets.order_icon} alt="" className="w-5 h-5" />
          <p className="hidden md:block">Store Settings</p>
        </NavLink>

        
      </div>
    </div>
  );
};

export default Sidebar;
