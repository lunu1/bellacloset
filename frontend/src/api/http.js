// central axios instance (base URL + credentials)



// Central axios instance for the whole app
import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api`,
  withCredentials: true, // send cookies for userAuth middleware
});
