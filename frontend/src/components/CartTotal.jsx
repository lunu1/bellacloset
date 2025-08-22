// CartTotal.jsx
// import { useSelector } from "react-redux";
import Title from "./Title";

function CartTotal({ items = [] }) {
  // const cartItemsFromStore = useSelector((state) => state.cart.items);
  // const cartItems = (Array.isArray(items) && items.length > 0)
  //   ? items
  //   : cartItemsFromStore;

  const currency = "₹";
  const deliveryFee = items.length === 0 ? 0 : 50;

  const subtotal = items.reduce((acc, item) => {
    const priceNum = Number(item.price) || 0;
    const qtyNum = Number(item.quantity) || 0;
    return acc + priceNum * qtyNum;
  }, 0);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        {items.map((item, idx) => {
          const priceNum = Number(item.price) || 0;
          const qtyNum = Number(item.quantity) || 0;
          return (
            <div className="flex justify-between" key={idx}>
              <p>{item.name} x {qtyNum}</p>
              <p>{currency}{(priceNum * qtyNum).toFixed(2)}</p>
            </div>
          );
        })}

        <hr />
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency}{subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency}{deliveryFee.toFixed(2)}</p>
        </div>
        <hr />
        <div className="flex justify-between font-semibold">
          <p>Total</p>
          <p>{currency}{(subtotal + deliveryFee).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default CartTotal;
