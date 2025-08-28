// src/components/PageWrapper.jsx
export default function PageWrapper({ title, children }) {
  document.title = `${title} · Bella Closet`;
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* wider */}
      <h1 className="text-3xl sm:text-4xl font-semibold mb-8">{title}</h1>
      <div className="prose prose-zinc max-w-none prose-headings:scroll-mt-24">
        {children}
      </div>
    </main>
  );
}
