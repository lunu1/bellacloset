import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import { backendURL } from "../../config";

export default function OrderHeader({ order }) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order #{order._id}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Order ID: {order._id}</span>
                  <CopyButton text={order._id} />
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            {/* Actions (invoice, etc.) */}
        <div className="mt-3 flex justify-end gap-2">
          <a
                    href={`${backendURL}/api/order/${order._id}/invoice.pdf`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1.5 text-sm border rounded hover:bg-black hover:text-white transition"
                  >
                    Download Invoice 
                  </a>

        </div>

          </div>
        </div>
      </div>
    </div>
  );
}
