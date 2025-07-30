import { useSelector } from "react-redux";
import Title from "./Title";

function CartTotal() {
  const cartItems = useSelector((state) => state.cart.items);
  const currency = "₹";
  const deliveryFee = cartItems.length === 0 ? 0 : 50;

  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal = (item.price || 0) * item.quantity;
    return acc + itemTotal;
  }, 0);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        {cartItems.map((item, index) => (
          <div className="flex justify-between" key={index}>
            <p>{item.name} x {item.quantity}</p>
            <p>{currency}{(item.price || 0) * item.quantity}.00</p>
          </div>
        ))}

        <hr />
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency}{subtotal}.00</p>
        </div>

        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency}{deliveryFee}.00</p>
        </div>

        <hr />
        <div className="flex justify-between font-semibold">
          <p>Total</p>
          <p>{currency}{subtotal + deliveryFee}.00</p>
        </div>
      </div>
    </div>
  );
}

export default CartTotal;
