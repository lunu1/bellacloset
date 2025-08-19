// src/components/product/ImageGallery.jsx
export default function ImageGallery({
  images = [],
  activeImage,
  onChange,
  showZoom,
  setShowZoom,
  zoomPosition,
  onMouseMove,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbs */}
      <div className="flex sm:flex-col justify-between overflow-x-auto sm:overflow-y-auto sm:w-[18.7%] w-full">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`thumb-${i}`}
            onClick={() => onChange(src)}
            className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 ${
              activeImage === src ? "border-black" : "border-transparent"
            } hover:border-gray-300 transition-all duration-200`}
          />
        ))}
        {images.length === 0 && (
          <div className="text-center text-gray-500 text-sm p-4">
            No images available
          </div>
        )}
      </div>

      {/* Main */}
      <div className="w-full sm:w-[80%] relative">
        {activeImage && (
          <img
            src={activeImage}
            alt="active"
            className="w-full h-auto cursor-zoom-in"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={onMouseMove}
          />
        )}
        {showZoom && activeImage && (
          <div
            className="absolute top-0 left-full ml-4 w-96 h-96 border border-gray-300 bg-white shadow-lg pointer-events-none hidden lg:block"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>
    </div>
  );
}
