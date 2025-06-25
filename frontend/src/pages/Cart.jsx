import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { updateQuantity, removeFromCart } from "../features/cart/cartSlice";



function Cart() {
  const dispatch = useDispatch();
const navigate = useNavigate();

const products = useSelector((state) => state.products.items);
const cartItems = useSelector((state) => state.cart.items);
const currency = "₹"; // or get it from global store if set

  const [cartData, setCartData] = useState([]);

  

useEffect(() => {
  setCartData(cartItems);
}, [cartItems]);

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-3xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product.product._id === item.productId);
            if (!productData) return null;

          return (
          <div
            key={index}
            className="grid py-4 text-gray-500 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
          >
            <div className="flex items-start gap-6">
              <img
                src={productData.product.images?.[0]}
                className="w-16 sm:w-20"
                alt=""
              />
              <div>
                <p className="text-xs font-medium sm:text-lg">
                  {productData.product.name}
                </p>
                <div className="flex items-center gap-5 mt-2">
                  <p>
                    {currency}
                    {productData.variants[0]?.price || "N/A"}
                  </p>
                  <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                    {item.size}
                  </p>
                </div>
              </div>
            </div>




              <input
                type="number"
                min={1}
                defaultValue={item.quantity}
                className="px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2"
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  if (qty > 0) {
                    dispatch(updateQuantity({ 
                      productId: item.productId, 
                      size: item.size, 
                      color: item.color, 
                      quantity: qty 
                    }));
                  }
                }}

              />
              <img
                src={assets.bin_icon}
                className="w-4 mr-4 cursor-pointer sm:w-5"
                alt=""
                onClick={() => dispatch(removeFromCart({ 
                productId: item.productId, 
                size: item.size, 
                color: item.color 
              }))}

              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              className="px-8 py-3 my-8 text-sm text-white bg-black"
              onClick={() => {
                navigate("/place-order");
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
