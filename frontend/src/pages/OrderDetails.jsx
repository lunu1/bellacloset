import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getOrderById } from "../features/order/orderSlice";

import OrderHeader from "../components/orders/OrderHeader";
import OrderSummary from "../components/orders/OrderSummary";
import OrderItems from "../components/orders/OrderItems";
import AddressCard from "../components/orders/AddressCard";
import TrackingCard from "../components/orders/TrackingCard";
import Timeline from "../components/orders/Timeline";
import BackButton from "../components/BackButton";

export default function OrderDetails() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { current: order, currentLoading, error } = useSelector(s => s.order);

  useEffect(() => { if (orderId) dispatch(getOrderById(orderId)); }, [dispatch, orderId]);

  if (currentLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{String(error)}</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
     
      
      <OrderHeader order={order} />
      
      <OrderSummary order={order} />
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderItems order={order} />
        </div>
        <div className="space-y-6">
          <AddressCard address={order.address} />
          <TrackingCard tracking={order.tracking} />
          <Timeline order={order} />
        </div>
      </div>
    </div>
  );
}
