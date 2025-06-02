import { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Twitter, CircleUser } from 'lucide-react';

export default function Footer() {
  // State to store footer data
  const [footerData, setFooterData] = useState({
    categories: [
      { id: 1, name: "Handbags", url: "#" },
      { id: 2, name: "Women's Watches", url: "#" },
      { id: 3, name: "Women's Shoes", url: "#" },
      { id: 4, name: "Women's Clothes", url: "#" },
      { id: 5, name: "Women's Fine Jewelry", url: "#" },
      { id: 6, name: "Women's Accessories", url: "#" },
      { id: 7, name: "Men's Watches", url: "#" },
      { id: 8, name: "Men's Bags", url: "#" },
      { id: 9, name: "Men's Shoes", url: "#" },
      { id: 10, name: "Men's Clothes", url: "#" },
      { id: 11, name: "Men's Fine Jewelry", url: "#" },
      { id: 12, name: "Men's Sneakers", url: "#" }
    ],
    brands: [
      { id: 1, name: "Chanel", url: "#" },
      { id: 2, name: "Rolex", url: "#" },
      { id: 3, name: "Louis Vuitton", url: "#" },
      { id: 4, name: "Hermes", url: "#" },
      { id: 5, name: "Gucci", url: "#" },
      { id: 6, name: "Dior", url: "#" },
      { id: 7, name: "Hermes", url: "#" },
      { id: 8, name: "Prada", url: "#" },
      { id: 9, name: "Coach", url: "#" },
      { id: 10, name: "Saint Laurent", url: "#" }
    ],
    about: [
      { id: 1, name: "About Us", url: "#" },
      { id: 2, name: "How Does It Work?", url: "#" },
      { id: 3, name: "Privacy Policy", url: "#" },
      { id: 4, name: "Terms & Conditions", url: "#" },
      { id: 5, name: "FAQs", url: "#" },
      { id: 6, name: "Sell Now", url: "#" },
      { id: 7, name: "Delivery & Returns", url: "#" },
      { id: 8, name: "Warranty", url: "#" },
      { id: 9, name: "Change My Preferences", url: "#" }
    ],
    customerService: [
      { id: 1, name: "Contact Us", url: "#" },
      { id: 2, name: "FAQs", url: "#" },
      { id: 3, name: "Student & Youth Discount", url: "#" },
      { id: 4, name: "Essential Worker Discount", url: "#" }
    ],
    contactInfo: {
      helpMessage: "We Are Here To Help You!",
      phone: "800 BEllA (800 589)",
      email: "info@bellacloset.com",
      hours: "Monday to Sunday",
      timeZone: "9 am to 9 pm (GST)"
    },
    socialMedia: [
      { id: 1, name: "Facebook", icon: "Facebook", url: "#" },
      { id: 2, name: "Instagram", icon: "Instagram", url: "#" },
      { id: 3, name: "Youtube", icon: "Youtube", url: "#" },
      { id: 4, name: "Twitter", icon: "Twitter", url: "#" },
      { id: 5, name: "Pinterest", icon: "CircleUser", url: "#" }
    ],
    apps: [
      { id: 1, name: "Google Play", image: "/api/placeholder/135/40", url: "#" },
      { id: 2, name: "App Store", image: "/api/placeholder/135/40", url: "#" }
    ],
    brandCategories: {
      louisVuitton: [
        { id: 1, name: "Louis Vuitton Bag", url: "#" },
        { id: 2, name: "Louis Vuitton Shoes", url: "#" },
        { id: 3, name: "Louis Vuitton Wallet", url: "#" },
        { id: 4, name: "Louis Vuitton Sneakers", url: "#" }
      ],
      gucci: [
        { id: 1, name: "Gucci Bag", url: "#" },
        { id: 2, name: "Gucci Shoes", url: "#" },
        { id: 3, name: "Gucci Sneakers", url: "#" },
        { id: 4, name: "Gucci Wallet", url: "#" },
        { id: 5, name: "Gucci Sandals", url: "#" }
      ],
      hermes: [
        { id: 1, name: "Hermes Bag", url: "#" },
        { id: 2, name: "Hermes Shoes", url: "#" },
        { id: 3, name: "Hermes Birkin", url: "#" },
        { id: 4, name: "Hermes Kelly", url: "#" },
        { id: 5, name: "Hermes Sandals", url: "#" }
      ],
      chanel: [
        { id: 1, name: "Chanel Bag", url: "#" },
        { id: 2, name: "Chanel Shoes", url: "#" },
        { id: 3, name: "Chanel Wallet", url: "#" },
        { id: 4, name: "Chanel Boots", url: "#" },
        { id: 5, name: "Chanel Sandals", url: "#" }
      ]
    },
    companyInfo: {
      address: "Novotel Dubai Al Barsha API Trio Tower Office 901 PO Box:502626",
      storeTimings: "Store Timings: Monday To Friday - 9 AM To 8 PM GST, Saturday - 10 AM To 8 PM GST, Sunday - Closed"
    }
  });

  // Function to fetch data from backend (to be implemented later)
  const fetchFooterData = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/footer-data');
      // const data = await response.json();
      // setFooterData(data);
      console.log('Would fetch footer data from backend here');
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };

  // Uncomment to fetch from backend when component mounts
  // useEffect(() => {
  //   fetchFooterData();
  // }, []);

  // Function to render social media icons
  const renderSocialIcon = (iconName) => {
    switch (iconName) {
      case 'Facebook':
        return <Facebook className="w-6 h-6" />;
      case 'Instagram':
        return <Instagram className="w-6 h-6" />;
      case 'Youtube':
        return <Youtube className="w-6 h-6" />;
      case 'Twitter':
        return <Twitter className="w-6 h-6" />;
      case 'CircleUser':
        return <CircleUser className="w-6 h-6" />;
      default:
        return <CircleUser className="w-6 h-6" />;
    }
  };

  return (
    <footer className="bg-black text-white py-12 mt-10">
      <div className="container mx-auto px-4">
        {/* Main footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Categories Column */}
          <div>
            <h3 className="font-medium text-lg mb-4">Top Categories</h3>
            <ul className="space-y-2">
              {footerData.categories.map((category) => (
                <li key={category.id}>
                  <a href={category.url} className="text-gray-300 hover:text-white">
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands Column */}
          <div>
            <h3 className="font-medium text-lg mb-4">Top Brands</h3>
            <ul className="space-y-2">
              {footerData.brands.map((brand) => (
                <li key={brand.id}>
                  <a href={brand.url} className="text-gray-300 hover:text-white">
                    {brand.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-medium text-lg mb-4">About The Luxury Closet</h3>
            <ul className="space-y-2">
              {footerData.about.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="font-medium text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {footerData.customerService.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <p className="font-medium">{footerData.contactInfo.helpMessage}</p>
              <p className="my-1">{footerData.contactInfo.phone}</p>
              <p className="mb-3">{footerData.contactInfo.email}</p>
              <p>{footerData.contactInfo.hours}</p>
              <p>{footerData.contactInfo.timeZone}</p>
            </div>
          </div>

          {/* Social & App Column */}
          <div>
            <h3 className="font-medium text-lg mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              {footerData.socialMedia.map((social) => (
                <a key={social.id} href={social.url} className="text-gray-300 hover:text-white">
                  {renderSocialIcon(social.icon)}
                </a>
              ))}
            </div>
            
            
          </div>
        </div>

        {/* Brand specific links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Louis Vuitton */}
          <div>
            <h3 className="font-medium mb-4">Shop Louis Vuitton</h3>
            <ul className="space-y-2">
              {footerData.brandCategories.louisVuitton.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Gucci */}
          <div>
            <h3 className="font-medium mb-4">Shop Gucci</h3>
            <ul className="space-y-2">
              {footerData.brandCategories.gucci.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hermes */}
          <div>
            <h3 className="font-medium mb-4">Shop Hermes</h3>
            <ul className="space-y-2">
              {footerData.brandCategories.hermes.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Chanel */}
          <div>
            <h3 className="font-medium mb-4">Shop Chanel</h3>
            <ul className="space-y-2">
              {footerData.brandCategories.chanel.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Address and store timing */}
        <div className="text-center text-gray-300 text-sm border-t border-gray-800 pt-8">
          <p className="mb-2">{footerData.companyInfo.address}</p>
          <p>{footerData.companyInfo.storeTimings}</p>
        </div>
      </div>
    </footer>
  );
}