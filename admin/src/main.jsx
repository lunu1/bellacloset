import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext.jsx";
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
    <AdminProvider>
      <App />
      </AdminProvider>
    </BrowserRouter>
  </Provider>
);
