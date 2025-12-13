import { ShoppingBag, BadgePercent, Shield, CreditCard } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      id: 1,
      icon: <ShoppingBag className="w-12 h-12 text-gray-500" />,
      title: "Unique Luxury Pieces",
      description: "Extensive luxury collection where each item is unique & high on fashion"
    },
    {
      id: 2,
      icon: <BadgePercent className="w-12 h-12 text-gray-500" />,
      title: "Affordable Luxury",
      description: "Stellar luxury pieces at irresistible discounts & with installment purchase options"
    },
    {
      id: 3,
      icon: <Shield className="w-12 h-12 text-gray-500" />,
      title: "Trusted Platform",
      description: "Reliable and secure platform with 25,000+ creation having lifetime authenticity guarantee."
    },
    {
      id: 4,
      icon: <CreditCard className="w-12 h-12 text-gray-500" />,
      title: "Worldwide Delivery & Returns",
      description: "What you see is what you get, else money back"
    }
  ];

  return (
    <div className="py-12 bg-white container mx-auto">
      <div className="">
        <h2 className="text-3xl font-thin text-center text-gray-900 mb-12">
          You Can Always Count On Us
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center text-center">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 ">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}