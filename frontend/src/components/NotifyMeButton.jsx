// src/components/NotifyMeButton.jsx
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import { subscribeBackInStock } from "../features/notify/notifySlice";
import { toast } from "react-toastify";

export default function NotifyMeButton({ productId, compact = false }) {
  const dispatch = useDispatch();
  const { isLoggedin } = useContext(AppContext);
  const loading = useSelector((s) => s.notify.loading);
  const [email, setEmail] = useState("");

  const onSubscribe = async () => {
    try {
      await dispatch(subscribeBackInStock({ productId, email: isLoggedin ? undefined : email })).unwrap();
      toast.success("We’ll email you when it’s back in stock.");
      setEmail("");
    } catch (e) {
      const msg = e?.message || e?.error || "Could not subscribe";
      toast.error(typeof msg === "string" ? msg : "Could not subscribe");
    }
  };

  if (compact) {
    return (
      <button
        disabled={loading}
        onClick={onSubscribe}
        className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:opacity-70 text-sm"
      >
        {loading ? "Subscribing..." : "Notify me"}
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {!isLoggedin && (
        <input
          type="email"
          placeholder="Your email"
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
      <button
        disabled={loading || (!isLoggedin && !email)}
        onClick={onSubscribe}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-70 text-sm"
      >
        {loading ? "Subscribing..." : "Notify me"}
      </button>
    </div>
  );
}
