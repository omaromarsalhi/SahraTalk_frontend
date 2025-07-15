import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://SahraTalkFE:3500/api/v1",
  withCredentials: true,
});
