import { useEffect, useState } from "react";
import axios from "axios";
import { backendURL } from "../config";
import { toast }   from "react-toastify";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discount: "",
    expiry: "",
    minAmount: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/coupon`);
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm({ code: "", discount: "", expiry: "", minAmount: "" });
    setEditId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${backendURL}/api/coupon/${editId}`, form);
        toast.success("Coupon updated successfully!");
      } else {
        await axios.post(`${backendURL}/api/coupon`, form);
       toast.success("Coupon created successfully!");
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
     toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (coupon) => {
    setForm({
      code: coupon.code,
      discount: coupon.discount,
      expiry: coupon.expiry?.substring(0, 10), // format date input
      minAmount: coupon.minAmount,
    });
    setEditId(coupon._id);
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`${backendURL}/api/coupon/${id}`);
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${backendURL}/api/coupon/toggle/${id}`);
      toast.success("Coupon status toggled successfully!");
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        {editId ? "Edit Coupon" : "Create Coupon"}
      </h2>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Discount %"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Minimum Amount"
          value={form.minAmount}
          onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="date"
          value={form.expiry}
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Select expiry Date"
          required
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {editId ? "Update" : "Create"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-2 text-sm text-gray-500 underline"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Coupon List</h3>
        {coupons.length === 0 ? (
          <p className="text-gray-500">No coupons available.</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="p-3 border flex justify-between items-center bg-white rounded"
              >
                <div>
                  <p className="font-bold">{coupon.code}</p>
                  <p className="text-sm text-gray-600">
                    Discount: {coupon.discount}% | Min: ₹{coupon.minAmount} |{" "}
                    Exp: {coupon.expiry?.substring(0, 10)} |{" "}
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        coupon.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleToggle(coupon._id)}
                    className={`text-sm hover:underline ${
                        coupon.isActive ? "text-red-600" : "text-green-600"
                    }`}
                    
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                    
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
