// src/components/checkout/PaymentSelector.jsx
export default function PaymentSelector({ method, setMethod }) {
  const methods = ["stripe", "razorpay", "cod"];
  return (
    <div className="mt-10">
      <div className="text-xl sm:text-2xl">PAYMENT <span className="font-semibold">METHOD</span></div>
      <div className="flex flex-col gap-3 lg:flex-row mt-4">
        {methods.map((m) => (
          <div
            key={m}
            onClick={() => setMethod(m)}
            className="flex items-center gap-3 p-2 px-3 border cursor-pointer"
          >
            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === m ? "bg-green-400" : ""}`} />
            <p className="mx-4 text-sm font-medium text-gray-500">{m.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
