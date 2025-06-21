import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext";
import { AppContextProvider } from "./context/AppContext.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
  <BrowserRouter>
    <AppContextProvider>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
    </AppContextProvider>
  </BrowserRouter>
  </Provider>
);
