import { useMemo, useState } from "react";

export default function NewsletterSignup({
  title = "Sign Up For Our Newsletter",
  subtitle = "Updates of our newest stock, promotions, and the latest fashion news.",
  endpoint = `${import.meta.env.VITE_BACKEND_URL || ""}/api/newsletter/subscribe`,
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const isValidEmail = useMemo(() => {
    // simple + reliable email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");

    const clean = email.trim().toLowerCase();

    if (!clean) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(clean)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include credentials if your backend uses cookies:
        // credentials: "include",
        body: JSON.stringify({ email: clean }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Subscription failed. Please try again.");
      }

      setStatus("success");
      setMessage(data?.message || "Thanks! You’re subscribed.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="flex flex-col items-center text-center">
          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-neutral-900">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-neutral-600">
            {subtitle}
          </p>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="mt-10 w-full max-w-2xl"
            aria-label="Newsletter signup form"
          >
            <div className="relative">
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-none border border-neutral-400 bg-transparent px-6 py-4 pr-16 text-base text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-700"
              />

              <button
                type="submit"
                disabled={status === "loading" || !isValidEmail}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full transition
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 active:scale-[0.98]"
                aria-label="Submit newsletter subscription"
                title="Subscribe"
              >
                {status === "loading" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                ) : (
                  <span className="text-2xl leading-none text-neutral-900">→</span>
                )}
              </button>
            </div>

            {/* Message */}
            {message ? (
              <p
                className={`mt-4 text-sm ${
                  status === "success"
                    ? "text-emerald-700"
                    : status === "error"
                    ? "text-red-600"
                    : "text-neutral-600"
                }`}
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
