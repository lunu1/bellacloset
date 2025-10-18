// src/components/product/ImageGallery.jsx
import { useRef, useEffect } from "react";

export default function ImageGallery({
  images = [],
  activeImage,
  onChange,
  showZoom,
  setShowZoom,
  zoomPosition,
  onMouseMove,
}) {
  const containerRef = useRef(null);

  // Keep active image in sync with the snapped slide
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const index = Math.round(scrollTop / clientHeight);
      const current = images[index];
      if (current && current !== activeImage) onChange?.(current);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [images, activeImage, onChange]);

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden">
      {/* Scoped scrollbar hiding for this component only */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Scrollable image list */}
      <div
        ref={containerRef}
        className="no-scrollbar w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        onMouseEnter={() => setShowZoom?.(true)}
        onMouseLeave={() => setShowZoom?.(false)}
        onMouseMove={onMouseMove}
      >
        {images?.length ? (
          images.map((src, i) => (
            <div
              key={i}
              className="snap-start w-full h-[70vh] sm:h-[80vh] flex items-center justify-center bg-white"
              onClick={() => onChange?.(src)}
            >
              <img
                src={src}
                alt={`slide-${i}`}
                className="w-full h-full object-contain select-none"
                draggable={false}
              />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No images available
          </div>
        )}
      </div>

      {/* Optional Zoom (desktop-only) */}
      {showZoom && activeImage && (
        <div className="hidden xl:block absolute top-0 right-0 translate-x-full ml-4 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] border rounded-md overflow-hidden bg-white">
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundSize: "200% 200%",
              backgroundPosition: `${zoomPosition?.x || 50}% ${zoomPosition?.y || 50}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
