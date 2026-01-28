import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBox from "./components/SearchBox";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/Signup";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import MegaNavbar from "./components/MegaNavbar";
//import ProtectedRoute from "./components/ProtectedRoute.jsx";

import UserProfile from "./pages/UserProfile";
import ProductShowcase from "./pages/ProductShowcase/ProductShowcase.jsx";
import WishlistPage from "./pages/wishlistPage.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import ProductsBrowsePage from "./pages/ProductsBrowsePage.jsx";
import { useDispatch } from "react-redux";
import { fetchShopSettings } from "./features/settings/settingSlice.js";
import { useContext, useEffect } from "react";

import AboutBella from "./pages/AboutBella.jsx";
import PrivacyPolicyBella from "./pages/PrivacyPolicyBella.jsx";
import TermsConditionsBella from "./pages/TermsConditionsBella.jsx";
import FAQBella from "./pages/FAQBella.jsx";
import DeliveryReturnsBella from "./pages/DeliveryReturnsBella.jsx";
import WhatsAppFloating from "./components/WhatsAppInquire.jsx";
import PersonalStylist from "./pages/PersonalStylist.jsx";
import SellPage from "./pages/SellPage.jsx";
import { getGuestCart, getGuestWishlist } from "./utils/guestStore.js";
import { loadCart, setGuestCartState } from "./features/cart/cartSlice.js";
import { getWishlist, setGuestWishlistState } from "./features/wishlist/wishlistSlice.js";
import { AppContext } from "./context/AppContext.jsx";
import { getAllProducts } from "./features/product/productSlice";


const App = () => {
  const dispatch = useDispatch();
  const { isLoggedin, userData, authLoading } = useContext(AppContext)
  const user = userData;

 useEffect(() => {
  if (authLoading) return; // wait until auth is checked

  if (!user) {
    dispatch(setGuestCartState(getGuestCart()));
    dispatch(setGuestWishlistState(getGuestWishlist()));
  } else {
    dispatch(loadCart());
    dispatch(getWishlist());
  }
}, [user, authLoading, dispatch]);

useEffect(() => {
  dispatch(getAllProducts());
}, [dispatch]);


  useEffect(() => {
    dispatch(fetchShopSettings());
  }, [dispatch]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        <Navbar />
        <MegaNavbar />
        <SearchBox />

        <WhatsAppFloating
          phone="971556055777"
          message="Hi! I want to inquire about a product."
          label="Inquire now"
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<Product />} />
          {/* Protected Pages */}
          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<WishlistPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/shop" element={<ProductShowcase />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/search" element={<SearchResults />} />
          {/* <Route path="/orders" element={<OrderPage />} /> */}
          <Route path="/about" element={<AboutBella />} />
          <Route path="/personal-stylist" element={<PersonalStylist />} />
          <Route path="/sell-page" element={<SellPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyBella />} />
          <Route path="/terms" element={<TermsConditionsBella />} />
          <Route path="/faq" element={<FAQBella />} />
          <Route path="/delivery-returns" element={<DeliveryReturnsBella />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<ProductsBrowsePage />} />
          <Route path="/c" element={<ProductsBrowsePage />} />
          <Route path="/c/:categoryId" element={<ProductsBrowsePage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
