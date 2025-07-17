import axios from "axios";
import { tokenService } from "../utils/tokenService";
import { useAuthStore } from "../store/useAuthStore";

const backend_url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3500";
export const axiosInstance = axios.create({
  baseURL: `${backend_url}/api/v1`,
  withCredentials: true,
});

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

const localDisconnectUser = () => {
  const { disconnetUser } = useAuthStore.getState();
  disconnetUser();
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        console.log("Attempting to refresh token...");
        const res = await axios.post(
          `${backend_url}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        console.log("Token refreshed successfully:", res.data);
        console.log("Response headers:", res.headers);
        const newAccessToken = res.data.access_token;
        tokenService.set(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError.response?.data || refreshError.message);
        localDisconnectUser();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
