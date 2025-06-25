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


import UserProfile from "./pages/UserProfile";
import ProductShowcase from "./pages/ProductShowcase/ProductShowcase.jsx";
import WishlistPage from "./pages/wishlistPage.jsx";

const App = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000}/>
      <Navbar />
      <MegaNavbar/>
      <SearchBox />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/shop" element={<ProductShowcase />} />
        <Route path="/wishlist" element= { <WishlistPage />} />
      </Routes>
      <Footer />

      
    </div>
  );
};

export default App;
