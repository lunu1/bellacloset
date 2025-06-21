import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext";
import { AppContextProvider } from "./context/AppContext.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store"; // adjust the path if needed
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppContextProvider>
          <ShopContextProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </ShopContextProvider>
        </AppContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
