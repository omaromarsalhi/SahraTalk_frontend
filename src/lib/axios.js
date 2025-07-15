import axios from "axios";
import { tokenService } from "../utils/tokenService";


const backend_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3500";
export const axiosInstance = axios.create({
  baseURL: `${backend_url}/api/v1`,
  withCredentials: true,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 error and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Call your refresh endpoint (adjust path as needed)
        const res = await axios.post(
          `${backend_url}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        console.log("Token refreshed successfully:", res.data);
        const newAccessToken = res.data.access_token;
        tokenService.set(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenService.remove();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
