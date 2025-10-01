import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

import ProfileHeader from "../components/profile/ProfileHeader";
import AddressList from "../components/address/AddressList";
import AddressForm from "../components/address/AddressForm";

import { validateProfile, validateAddress, sanitizePhoneInput } from "../utils/validators";
import { Plus } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState(null);

  // profile (no phone on top)
  const [form, setForm] = useState({ name: "", email: "" });
  const [formErrors, setFormErrors] = useState({});
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  // addresses
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  // add address
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });
  const [addressErrors, setAddressErrors] = useState({});

  // edit address
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });
  const [editAddressErrors, setEditAddressErrors] = useState({});

  const { backendUrl } = useContext(AppContext);

  /** ===== Fetches ===== */
  const getUserProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`);
      if (res.data?.user) {
        setUser(res.data.user);
        setForm({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user profile: ", err);
    }
  };

  const getAddresses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/addresses`);
      const list = res.data.addresses || [];
      setAddresses(list);

      const def = list.find((a) => a.isDefault);
      if (def) setDefaultAddressId(def._id);
      else if (list.length > 0 && !defaultAddressId) {
        handleDefaultSelect(list[0]._id);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  useEffect(() => {
    getUserProfile();
    getAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ===== Profile actions ===== */
  const updateProfile = async () => {
    const errs = validateProfile(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await axios.put(`${backendUrl}/api/user/update-profile`, form);
      setUser(res.data.user);
      setEditingName(false);
      setEditingEmail(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  /** ===== Address actions ===== */
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
    const errs = validateAddress(newAddress);
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, newAddress);
      setAddresses(res.data.addresses);
      setNewAddress({ street: "", city: "", state: "", zip: "", country: "", phone: "" });
      setAddressErrors({});
      setShowAddAddress(false);
      toast.success("Address added successfully!");
    } catch (err) {
      console.error("Add address failed:", err);
      toast.error(err?.response?.data?.message || "Failed to add address");
    }
  };

  const startEditAddress = (address) => {
    setEditForm({
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "",
      phone: sanitizePhoneInput(address.phone || ""),
    });
    setEditId(address._id);
    setEditAddressErrors({});
    setShowEdit(true);
  };

  const updateAddress = async () => {
    const errs = validateAddress(editForm);
    setEditAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!editId || !addresses.some((a) => a._id === editId)) {
      toast.error("Selected address no longer exists. Reloading…");
      await getAddresses();
      setShowEdit(false);
      return;
    }

    try {
      const response = await axios.put(`${backendUrl}/api/user/address/${editId}`, editForm);
      if (response.data.success) {
        toast.success("Address updated successfully");
        getAddresses();
        setShowEdit(false);
      }
    } catch (err) {
      console.error("Update address failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update address");
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      setAddresses((prev) => prev.filter((addr) => addr._id !== id)); // optimistic
      await axios.delete(`${backendUrl}/api/user/delete/${id}`);
      toast.success("Address deleted successfully!");
      if (id === defaultAddressId) setDefaultAddressId(null);
    } catch (err) {
      console.error("Delete address failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete address");
      getAddresses();
    }
  };

  return (
    <div className="min-h-screen py-8 container mx-auto">
      <div className="max-w-2xl mx-auto px-4">
        {user && (
          <div className="bg-slate-100 rounded-xl shadow-lg p-8">
            <ProfileHeader
              user={user}
              form={form}
              setForm={setForm}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              editingName={editingName}
              setEditingName={setEditingName}
              editingEmail={editingEmail}
              setEditingEmail={setEditingEmail}
              onSave={updateProfile}
            />

            <AddressList
              addresses={addresses}
              defaultAddressId={defaultAddressId}
              onMakeDefault={handleDefaultSelect}
              onEdit={startEditAddress}
              onDelete={deleteAddress}
            />

            {/* Add Address */}
            {showAddAddress ? (
              <AddressForm
                title="Add New Address"
                values={newAddress}
                setValues={setNewAddress}
                errors={addressErrors}
                setErrors={setAddressErrors}
                onSubmit={addAddress}
                onCancel={() => {
                  setShowAddAddress(false);
                  setAddressErrors({});
                }}
                submitLabel="Save"
              />
            ) : (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-700 text-white px-6 py-3 rounded-md"
                >
                  <Plus size={20} /> Add Address
                </button>
              </div>
            )}

            {/* Edit Address */}
            {showEdit && (
              <div className="mt-4">
                <AddressForm
                  title="Edit Address"
                  values={editForm}
                  setValues={setEditForm}
                  errors={editAddressErrors}
                  setErrors={setEditAddressErrors}
                  onSubmit={updateAddress}
                  onCancel={() => {
                    setShowEdit(false);
                    setEditAddressErrors({});
                  }}
                  submitLabel="Update"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
