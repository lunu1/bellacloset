import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { fetchPublicFeatures } from "../api/featureApi";

// safe icon resolver
const getLucideIcon = (iconName) => {
  const Icon = Icons?.[iconName];
  return Icon ? Icon : Icons.HelpCircle;
}; 

export default function FeaturesSection() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconClass = "w-12 h-12 text-gray-500";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicFeatures();
        if (mounted) setFeatures(data);
      } catch (e) {
        console.error("Failed to load features:", e);
        if (mounted) setFeatures([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const rendered = useMemo(() => {
    return features.map((f) => {
      const IconComp = getLucideIcon(f.icon);
      return {
        ...f,
        iconEl: <IconComp className={iconClass} />,
      };
    });
  }, [features]);

  return (
    <div className="py-12 bg-white container mx-auto">
      <h2 className="text-3xl font-thin text-center text-gray-900 mb-12">
        You Can Always Count On Us
      </h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : rendered.length === 0 ? (
        <div className="text-center text-gray-500">No features found.</div>
      ) : (
   <div className="flex flex-wrap justify-center gap-8">
  {rendered.map((feature) => (
    <div
      key={feature._id}
      className="
        flex flex-col items-center text-center
        w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]
      "
    >
      <div className="mb-4">{feature.iconEl}</div>

      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {feature.title}
      </h3>

      <p className="text-sm text-gray-500">
        {feature.description}
      </p>
    </div>
  ))}
</div>

      )}
    </div>
  );
}
