import { Edit3, Check } from "lucide-react";
import { emailRegex } from "../../utils/validators";

export default function ProfileHeader({
  user,
  form,
  setForm,
  formErrors,
  setFormErrors,
  editingName,
  setEditingName,
  editingEmail,
  setEditingEmail,
  onSave,
}) {
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const onProfileEmailChange = (e) => {
    const v = e.target.value.trimStart();
    setForm((f) => ({ ...f, email: v }));
    setFormErrors((prev) => ({
      ...prev,
      email: v && !emailRegex.test(v) ? "Enter a valid email address." : undefined,
    }));
  };

  const saveName = () => (editingName ? onSave() : setEditingName(true));
  const saveEmail = () => (editingEmail ? onSave() : setEditingEmail(true));

  return (
    <div className="text-center mb-8">
      <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-black rounded-full mx-auto mb-4
                      flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
        {userInitial}
      </div>

      {/* Name */}
      <div className="flex items-center justify-center gap-3 mb-2">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() =>
                setFormErrors((p) => ({ ...p, name: !form.name.trim() ? "Name is required." : undefined }))
              }
              className="text-2xl sm:text-3xl font-bold text-gray-900 text-center border-b-2 border-yellow-600
                         focus:outline-none bg-transparent"
              autoFocus
              placeholder="Your name"
            />
            <button onClick={saveName} className="text-green-600 hover:text-green-700">
              <Check size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.name || "User Name"}</h1>
            <button onClick={() => setEditingName(true)} className="text-gray-500 hover:text-blue-600">
              <Edit3 size={18} />
            </button>
          </div>
        )}
      </div>
      {formErrors.name && <p className="text-red-600 text-sm -mt-1 mb-2">{formErrors.name}</p>}

      {/* Email */}
      <div className="flex justify-center items-center gap-3 mb-2">
        {editingEmail ? (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={form.email}
              onChange={onProfileEmailChange}
              onBlur={() =>
                setFormErrors((p) => ({
                  ...p,
                  email: !form.email.trim()
                    ? "Email is required."
                    : !emailRegex.test(form.email)
                    ? "Enter a valid email address."
                    : undefined,
                }))
              }
              className="text-gray-600 text-center border-b-2 border-yellow-600 focus:outline-none bg-transparent"
              autoFocus
              placeholder="you@example.com"
            />
            <button onClick={saveEmail} className="text-green-600 hover:text-green-700">
              <Check size={20} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <p className="text-gray-600">{user?.email || "User Email"}</p>
            <button onClick={() => setEditingEmail(true)} className="text-gray-500 hover:text-blue-600">
              <Edit3 size={18} />
            </button>
          </div>
        )}
      </div>
      {formErrors.email && <p className="text-red-600 text-sm -mt-1 mb-2">{formErrors.email}</p>}
    </div>
  );
}
