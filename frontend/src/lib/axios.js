import axios from "axios";

// Always use /api since we're serving from the same port in production
const BASE_URL = "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});