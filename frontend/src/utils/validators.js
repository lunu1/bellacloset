// // Shared validators

// export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// // Phone (addresses only): exactly 10 digits
// export const sanitizePhoneInput = (raw = "") => String(raw).replace(/\D/g, "").slice(0, 10);
// export const isValidPhone10 = (raw = "") => /^\d{10}$/.test(sanitizePhoneInput(raw));

// export const validateProfile = (form) => {
//   const errs = {};
//   if (!form.name?.trim()) errs.name = "Name is required.";
//   if (!form.email?.trim()) errs.email = "Email is required.";
//   else if (!emailRegex.test(form.email)) errs.email = "Enter a valid email address.";
//   return errs;
// };

// export const validateAddress = (addr) => {
//   const errs = {};
//   if (!addr.street?.trim()) errs.street = "Street is required.";
//   if (!addr.city?.trim()) errs.city = "City is required.";
//   if (!addr.state?.trim()) errs.state = "State is required.";
//   if (!addr.zip?.trim()) errs.zip = "ZIP/Postal code is required.";
//   if (!addr.country?.trim()) errs.country = "Country is required.";
//   if (addr.phone) {
//     if (!isValidPhone10(addr.phone)) errs.phone = "Phone must be exactly 10 digits.";
//   }
//   return errs;
// };


// Shared validators
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// ---------------- No-special-characters helpers ----------------
// Allow common address punctuation: . , - / # ( ) and spaces
const SAFE_TEXT_REGEX = /^[A-Za-z0-9\s.,\-/#()]+$/;

const isSafeText = (v = "") => {
  const s = String(v ?? "").trim();
  if (!s) return true;
  return SAFE_TEXT_REGEX.test(s);
};

const safeTextMsg = "Only letters, numbers, spaces, and . , - / # ( ) are allowed.";

// ---------------- UAE Phone ----------------
export const sanitizePhoneInput = (raw = "") => {
  const v = String(raw ?? "");
  let cleaned = v.replace(/[^\d+]/g, "");
  cleaned = cleaned.replace(/(?!^)\+/g, ""); // allow + only at start
  return cleaned;
};

const normalizeUaePhone = (raw = "") => String(raw || "").replace(/\D/g, "");

export const isValidUaePhone = (raw = "") => {
  const p = normalizeUaePhone(raw);
  return /^05\d{8}$/.test(p) || /^5\d{8}$/.test(p) || /^9715\d{8}$/.test(p);
};

export const toUaePhoneE164 = (raw = "") => {
  const p = normalizeUaePhone(raw);
  if (/^9715\d{8}$/.test(p)) return `+${p}`;
  if (/^05\d{8}$/.test(p)) return `+971${p.slice(1)}`;
  if (/^5\d{8}$/.test(p)) return `+971${p}`;
  return "";
};

// ---------------- Profile validation ----------------
export const validateProfile = (form) => {
  const errs = {};

  if (!form.name?.trim()) errs.name = "Name is required.";
  else if (!isSafeText(form.name)) errs.name = safeTextMsg;

  if (!form.email?.trim()) errs.email = "Email is required.";
  else if (!emailRegex.test(form.email)) errs.email = "Enter a valid email address.";

  // Optional profile phone (if you have it)
  if (form.phone !== undefined && String(form.phone).trim() !== "") {
    if (!isValidUaePhone(form.phone)) errs.phone = "Enter a valid UAE mobile number.";
  }

  return errs;
};

// ---------------- UAE Address validation ----------------
const ALLOWED_EMIRATES = new Set([
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Fujairah",
  "Ras Al Khaimah",
  "Umm Al Quwain",
]);

export const validateAddress = (addr = {}) => {
  const errs = {};

  // Required UAE fields
  if (!addr.fullName?.trim()) errs.fullName = "Full name is required.";
  else if (!isSafeText(addr.fullName)) errs.fullName = safeTextMsg;

  if (!addr.phone?.trim()) errs.phone = "Phone is required.";
  else if (!isValidUaePhone(addr.phone))
    errs.phone = "Enter a valid UAE mobile (05XXXXXXXX or +9715XXXXXXXX).";

  if (!addr.unitNumber?.trim()) errs.unitNumber = "Unit number is required.";
  else if (!isSafeText(addr.unitNumber)) errs.unitNumber = safeTextMsg;

  if (!addr.buildingName?.trim()) errs.buildingName = "Building name is required.";
  else if (!isSafeText(addr.buildingName)) errs.buildingName = safeTextMsg;

  if (!addr.area?.trim()) errs.area = "Area / community is required.";
  else if (!isSafeText(addr.area)) errs.area = safeTextMsg;

  if (!addr.city?.trim()) errs.city = "City is required.";
  else if (!isSafeText(addr.city)) errs.city = safeTextMsg;

  if (!addr.emirate?.trim()) errs.emirate = "Emirate is required.";
  else if (!ALLOWED_EMIRATES.has(addr.emirate.trim())) errs.emirate = "Select a valid emirate.";

  // Optional fields: validate “no special chars” too (only if filled)
  const optionalSafe = (key) => {
    if (addr[key] !== undefined && String(addr[key]).trim() !== "" && !isSafeText(addr[key])) {
      errs[key] = safeTextMsg;
    }
  };

  optionalSafe("label");
  optionalSafe("street");
  optionalSafe("landmark");
  optionalSafe("poBox");
  optionalSafe("postalCode");

  // Address type validation (optional)
  if (addr.addressType && !["apartment", "villa", "office"].includes(addr.addressType)) {
    errs.addressType = "Invalid address type.";
  }

  // Optional length limits
  const maxLen = (key, label, n) => {
    const v = String(addr[key] ?? "");
    if (v && v.length > n) errs[key] = `${label} is too long (max ${n} characters).`;
  };

  maxLen("label", "Label", 30);
  maxLen("fullName", "Full name", 60);
  maxLen("unitNumber", "Unit number", 20);
  maxLen("buildingName", "Building name", 80);
  maxLen("street", "Street", 80);
  maxLen("area", "Area", 60);
  maxLen("city", "City", 60);
  maxLen("landmark", "Landmark", 80);
  maxLen("poBox", "PO Box", 20);
  maxLen("postalCode", "Postal code", 20);

  return errs;
};
