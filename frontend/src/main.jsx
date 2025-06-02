import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext";
import { AppContextProvider } from "./context/AppContext.jsx";


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
    </AppContextProvider>
  </BrowserRouter>
);
