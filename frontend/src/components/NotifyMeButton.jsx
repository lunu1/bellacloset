// src/components/NotifyMeButton.jsx
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import { subscribeBackInStock } from "../features/notify/notifySlice";
import { toast } from "react-toastify";
import { useNavigate,useLocation } from "react-router-dom";

export default function NotifyMeButton({ productId, compact = false }) {
  const dispatch = useDispatch();
  const { isLoggedin } = useContext(AppContext);
  const loading = useSelector((s) => s.notify.loading);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubscribe = async () => {
      if (!isLoggedin) {
        // redirect to login, then come back
        return navigate("/login", { state: { from: location.pathname } });
      }
      try {
        await dispatch(subscribeBackInStock({ productId })).unwrap();
        toast.success("We’ll email you when it’s back in stock.");
       
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
   
    <button
      disabled={loading}    
      onClick={onSubscribe}
      className="w-full bg-yellow-600 text-white py-3 rounded hover:bg-yellow-700 disabled:opacity-70 text-sm"
    >
      {loading ? "Subscribing..." : "Notify me when available"}
    </button>
  );
}
