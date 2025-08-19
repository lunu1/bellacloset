// src/components/product/ProductTabs.jsx
export default function ProductTabs({ activeTab, setActiveTab, product, reviews = [], availableSizes = [] }) {
  return (
    <div className="mt-20">
      <div className="flex border-b">
        {["description", "reviews", "specifications"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-b-2 border-black" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "description" && "Description"}
            {tab === "reviews" && `Reviews (${reviews.length})`}
            {tab === "specifications" && "Specifications"}
          </button>
        ))}
      </div>

      <div className="py-6">
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
            <p className="text-gray-600 leading-relaxed">
              This premium product is crafted with attention to detail and quality materials. Perfect for daily use,
              it combines style and functionality to meet your needs.
            </p>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{review.user}</p>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        {"★".repeat(review.rating)}
                        <span className="text-gray-300">
                          {"★".repeat(Math.max(0, 5 - review.rating))}
                        </span>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
            <button className="text-blue-600 hover:underline">Load more reviews</button>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <SpecRow label="Brand" value={product.brand || "N/A"} />
              <SpecRow label="Category" value={product.category} />
              <SpecRow label="Material" value={product.material || "Premium Quality"} />
            </div>
            <div className="space-y-3">
              <SpecRow
                label="Available Sizes"
                value={availableSizes.length ? availableSizes.join(", ") : "One Size"}
              />
              <SpecRow label="Care Instructions" value="Machine wash cold" />
              <SpecRow label="Country of Origin" value="India" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="font-medium">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
