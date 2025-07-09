import { useContext, useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";
// import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { LuPlus } from "react-icons/lu";
import { PiPencilSimpleLineDuotone } from "react-icons/pi";


function PlaceOrder() {
  const [method, setMethod] = useState("cod");
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [savedAddresses, setSavedAddresses] = useState([]);

 const [selectedAddress, setSelectedAddress] = useState(null);

  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zip: '', country: ''
  });
 



  useEffect(() => {
  const fetchDefaultAddress = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/addresses`);
      const addresses = res.data.addresses || [];
      setSavedAddresses(addresses);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  fetchDefaultAddress();
}, [backendUrl]);

  const handlePlaceOrder = async () => {
    const selectedAddress = useNewAddress ? newAddress : selectedAddress;

    if (!selectedAddress || !selectedAddress.street) {
      toast.error("Please provide a valid delivery address.");
      return;
    }

    const orderData = {
      products: [
        {
          productId: state?.productId,
          variantId: state?.variantId,
          size: state?.size,
          color: state?.color,
          quantity: state?.quantity,
        }
      ],
      totalAmount: state?.price * state?.quantity,
      address: selectedAddress,
      paymentMethod: method
    };

    try {
      await axios.post(`${backendUrl}/api/order/place`, orderData);
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error("Failed to place order");
      console.error(err);
    }
  };

  const handleSaveAddress = async () => {
    const { street, city, state, zip, country } = newAddress;
    if (!street || !city || !state || !zip || !country){
      toast.error("Please fill in all address fields. ");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, newAddress);
      
      const saved = res.data.addresses;

      // Add to saved Address List
      setSavedAddresses(prev => [...prev, saved]);
      setSelectedAddress(saved); // auto-select newly added address

      // Set as default if none exist yet
      // if (!) {
      //   setDefaultAddress(saved);
      // }

      //Reset form and toggle view
      setUseNewAddress(false);
      setNewAddress({
        street: '', city: '', state: '', zip: '', country: ''
      });
      toast.success("Address saved successfully!");
     } catch (err) {
      toast.error("Failed to save address");
      console.error(err);
    }
  } 

  return (
    <div className="flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t">
      {/* Left Section: Address Selection */}

      <div className="w-full sm:max-w-[50%]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1="SHIPPING"  text2="ADDRESS" />
        </div>

      {/* Add Address Button */}
     <button
          className="mb-4 flex items-center gap-1 text-blue-600  text-sm hover:text-blue-800"
          onClick={() => setUseNewAddress(true)}
        >
          <LuPlus className="w-4 h-4" />
          Add a new address
        </button>


         {/* Address Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* If using saved addresses */}
          { savedAddresses.map((address, index) => (
            <div 
               key={index}
               onClick={() => {
               setSelectedAddress(address);
                setUseNewAddress(false);
               }}
               className={`p-4 border rounded shadow-sm cursor-pointer ${
                selectedAddress?.id === address.id? "border-gray-400 bg-gray-200" : "border-gray-300"
               }`}>
                <p className="font-semibold">{address.street}</p>
                <p className="text-sm text-gray-700">{address.city}</p>
                <p className="text-sm text-gray-700">{address.state}</p>
                <p className="text-sm text-gray-700">{address.zip}</p>
                <p className="text-sm text-gray-700">{address.country}</p>
               
                </div>
          ))}
          </div>

          {/* If user choose to add new address */}
           {useNewAddress && (
      <div className="mt-6 border border-gray-300 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">New Address</h3>
        <div className="space-y-3">
          {["street", "city", "state", "zip", "country"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-600 capitalize mb-1">{field}</label>
              <input
                placeholder={`Enter ${field}`}
                value={newAddress[field]}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, [field]: e.target.value }))
                }
                className="w-full border p-2 rounded text-sm"
              />
              
            </div>
          ))}
        </div>
       <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleSaveAddress}
              className="px-4 py-2 mt-4 text-white bg-black hover:bg-gray-800 rounded text-sm"
            >
              Save Address
            </button>
            <button
              onClick={() => {
                setUseNewAddress(false);
                setNewAddress({
                  street: '',
                  city: '',
                  state: '',
                  zip: '',
                  country: '',
                });
              }}
              className="px-4 py-2 mt-4 text-gray-700 hover:bg-gray-200 rounded text-sm border "
            >
              Cancel
            </button>
          </div>

       
      </div>
      
      
    )}
    
  </div>
  


       {/* Right Section: Order Summary */}
  <div className="w-full sm:max-w-[45%] mt-8">
  {/* Product Detail Summary */}
  <div className="border border-gray-200 rounded p-4 mb-6 shadow-sm bg-white">
    <div className="flex items-center gap-4">
      {/* Product Image */}
      <img
        src={state?.thumbnail}
        alt="product"
        className="w-20 h-28 object-cover rounded"
      />

      {/* Product Details */}
      <div className="flex-1 mt-4">
        <h2 className="text-lg font-semibold">{state?.productName}</h2>
        <p className="text-sm">Size: {state?.size}</p>
         {/* <p className="text-sm">Color: <span className="inline-block w-4 h-4 rounded-full" style={{ background: state?.color }} /></p> */}
        <p className="text-sm">Quantity: {state?.quantity}</p>
      </div>

      {/* Edit Icon */}
      <div className="text-gray-500 hover:text-black cursor-pointer"
      onClick={() => navigate(`/product/${state?.productId}`)}>
        <PiPencilSimpleLineDuotone size={20} />
        {/* Optional: wrap in button if needed */}
        {/* <button onClick={handleEdit}>Edit</button> */}
      </div>
    </div>
  </div>



    {/* Cart Total Section */}
    <CartTotal />

    {/* Payment Method */}
    <div className="mt-10">
      <Title text1="PAYMENT" text2="METHOD" />
      <div className="flex flex-col gap-3 lg:flex-row mt-4">
        {['stripe', 'razorpay', 'cod'].map((methodType) => (
          <div
            key={methodType}
            onClick={() => setMethod(methodType)}
            className="flex items-center gap-3 p-2 px-3 border cursor-pointer"
          >
            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === methodType ? "bg-green-400" : ""}`} />
            <p className="mx-4 text-sm font-medium text-gray-500">{methodType.toUpperCase()}</p>
          </div>
        ))}
      </div>

      <div className="w-full text-end">
        <button
          className="px-16 py-3 my-8 text-sm text-white bg-black"
          onClick={handlePlaceOrder}
        >
          PLACE ORDER
        </button>
      </div>
    </div>
  </div>
</div>
  );
}

export default PlaceOrder;
