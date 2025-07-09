import { useContext, useEffect, useState } from "react";
import { Edit3, NotebookTabs,  Plus, Trash2, Check } from 'lucide-react';
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast} from "react-toastify";


const addressFields = ["street", "city", "state", "zip", "country"];

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [addresses, setAddresses] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ street: "", city: "", state: "", zip: "", country: "" });
  const [editId, setEditId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const { backendUrl } = useContext(AppContext);

  

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault);
      if (defaultAddr?._id) {
        setDefaultAddressId(defaultAddr._id);
      }
    }
  }, [addresses]);

  const getUserProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setForm({ name: res.data.user.name || "", email: res.data.user.email || "" });
      }
    } catch (err) {
      console.error("Error fetching user profile: ", err);
    }
  };


  
  const updateProfile = async () => {
    try {
      const res = await axios.put(`${backendUrl}/api/user/update-profile`, form);
      setUser(res.data.user);
      setEditingName(false);
      setEditingEmail(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error("Failed to update profile");
    }
  };

  const getAddresses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/addresses`);
      const addressList = res.data.addresses || [];
      setAddresses(addressList);

      const defaultOne = addressList.find(addr => addr.isDefault);
      if (defaultOne) {
        setDefaultAddressId(defaultOne._id);
      } else if (addressList.length > 0 && !defaultAddressId) {
        handleDefaultSelect(addressList[0]._id);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  useEffect(() => {
    getUserProfile();
    getAddresses();
  },[]);



  

  const handleDefaultSelect = async (id) => {
    try {
      const res = await axios.put(`${backendUrl}/api/user/address/default/${id}`);
      setAddresses(res.data.addresses);
      setDefaultAddressId(id);
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  const addAddress = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, newAddress);
      setAddresses(res.data.addresses);
      setNewAddress({ street: "", city: "", state: "", zip: "", country: "" });
      setShowAddAddress(false);
      toast.success("Address added successfully!");
    } catch (err) {
      console.error("Add address failed:", err);
      toast.error("Failed to add address");
    }
  };

  const updateAddress = async () => {
    try {
      const response = await axios.put(`${backendUrl}/api/user/address/${editId}`, editForm);
      if (response.data.success) {
        toast.success("Address updated successfully");
        getAddresses();
        setShowEdit(false);
      }
    } catch (err) {
      console.error("Update address failed:", err);
      toast.error("Failed to update address");
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      setAddresses(prev => prev.filter(addr => addr._id !== id)); // Optimistic update
      await axios.delete(`${backendUrl}/api/user/delete/${id}`);
      toast.success("Address deleted successfully!");
    } catch (err) {
      console.error("Delete address failed:", err);
      toast.error("Failed to delete address");
    }
  };

  const handleNameEdit = () => {
    if (editingName) {
      updateProfile();
    } else {
      setEditingName(true);
    }
  };

  const handleEmailEdit = () => {
    if (editingEmail) {
      updateProfile();
    } else {
      setEditingEmail(true);
    }
  };

  return (
    <div className="min-h-screen py-8 container mx-auto">
      <div className="max-w-2xl mx-auto px-4">
        {user && (
          <div className="bg-slate-100 rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-black rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl  sm:text-3xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* Name */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="text-2xl sm:text-3xl font-bold text-gray-900 text-center border-b-2 border-yellow-600 focus:outline-none bg-transparent"
                      autoFocus
                    />
                    <button onClick={handleNameEdit} className="text-green-600 hover:text-green-700">
                      <Check size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name || "User Name"}</h1>
                    <button onClick={() => setEditingName(true)} className="text-gray-500 hover:text-blue-600">
                      <Edit3 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="flex justify-center items-center gap-3 mb-8">
                {editingEmail ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="text-gray-600 text-center border-b-2 border-yellow-600 focus:outline-none bg-transparent"
                      autoFocus
                    />
                    <button onClick={handleEmailEdit} className="text-green-600 hover:text-green-700">
                      <Check size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center">
                    <p className="text-gray-600">{user.email || "User Email"}</p>
                    <button onClick={() => setEditingEmail(true)} className="text-gray-500 hover:text-blue-600">
                      <Edit3 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses Section */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <NotebookTabs size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
              </div>

              {addresses.map((address, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <input
                      type="radio"
                      name="defaultAddress"
                      checked={defaultAddressId === address._id}
                      onChange={() => handleDefaultSelect(address._id)}
                      className="mt-1 "
                    />

                    <div className="flex-1 mx-4">
                      <p className="font-medium text-gray-900">{address.street}</p>
                      <p className="text-gray-900">{address.city}, {address.state} {address.zip}</p>
                      <p className="text-gray-900">{address.country}</p>
                      {address.isDefault && (
                        <span className="text-green-600 text-sm font-medium">(Default)</span>
                      )}
                    </div>

                    <div className="flex gap-3 items-start">
                      <button
                        onClick={() => {
                          setEditForm({ ...address });
                          setEditId(address._id);
                          setShowEdit(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button
                        onClick={() => deleteAddress(address._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Address */}
              {showAddAddress ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-medium mb-4">Add New Address</h3>
                  {addressFields.map(field => (
                    <div key={field} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        value={newAddress[field]}
                        onChange={e => setNewAddress({ ...newAddress, [field]: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button onClick={addAddress} className="flex-1 bg-black hover:bg-gray-600 text-white py-2 rounded-md">Save</button>
                    <button onClick={() => setShowAddAddress(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button onClick={() => setShowAddAddress(true)} className="inline-flex bg-black hover:bg-gray-700 text-white px-6 py-3 rounded-md">
                    <Plus size={20} /> Add Address
                  </button>
                </div>
              )}

              {/* Edit Address */}
              {showEdit && (
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <h3 className="text-xl font-medium mb-4">Edit Address</h3>
                  {addressFields.map(field => (
                    <div key={field} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        value={editForm[field]}
                        onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button onClick={updateAddress} className="flex-1 bg-black text-white py-2 rounded-md">Update</button>
                    <button onClick={() => setShowEdit(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default UserProfile;