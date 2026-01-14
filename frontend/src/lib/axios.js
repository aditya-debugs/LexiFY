import axios from "axios";
import { auth } from "./firebase";

// Always use /api since we're serving from the same port in production
const BASE_URL = "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

// Add request interceptor to include Firebase token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
