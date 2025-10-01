// Shared validators

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Phone (addresses only): exactly 10 digits
export const sanitizePhoneInput = (raw = "") => String(raw).replace(/\D/g, "").slice(0, 10);
export const isValidPhone10 = (raw = "") => /^\d{10}$/.test(sanitizePhoneInput(raw));

export const validateProfile = (form) => {
  const errs = {};
  if (!form.name?.trim()) errs.name = "Name is required.";
  if (!form.email?.trim()) errs.email = "Email is required.";
  else if (!emailRegex.test(form.email)) errs.email = "Enter a valid email address.";
  return errs;
};

export const validateAddress = (addr) => {
  const errs = {};
  if (!addr.street?.trim()) errs.street = "Street is required.";
  if (!addr.city?.trim()) errs.city = "City is required.";
  if (!addr.state?.trim()) errs.state = "State is required.";
  if (!addr.zip?.trim()) errs.zip = "ZIP/Postal code is required.";
  if (!addr.country?.trim()) errs.country = "Country is required.";
  if (addr.phone) {
    if (!isValidPhone10(addr.phone)) errs.phone = "Phone must be exactly 10 digits.";
  }
  return errs;
};
