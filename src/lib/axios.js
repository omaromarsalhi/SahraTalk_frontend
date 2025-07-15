import axios from "axios";

// const backend_url = import.meta.env.BACKEND_URL || "http://localhost:3500";
const backend_url = "https://omar.italynorth.cloudapp.azure.com";
export const axiosInstance = axios.create({
  baseURL: `${backend_url}/api/v1`,
  withCredentials: true,
});
