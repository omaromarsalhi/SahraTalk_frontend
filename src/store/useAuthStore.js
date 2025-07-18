import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { tokenService } from "../utils/tokenService";
import { useChatStore } from "./useChatStore.js";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3500"
    : import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      if (res.data.accessToken) {
        tokenService.set(res.data.accessToken);
      }
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/signin", data);
      if (!res.data) throw new Error("Login failed");
      set({ authUser: res.data });
      if (res.data.access_token) {
        tokenService.set(res.data.access_token);
      }
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout").catch(() => {});
    set({ authUser: null });
    tokenService.remove();
    toast.success("Logged out successfully");
    // get().disconnectSocket();
  },

  disconnetUser: async () => {
    set({ authUser: null });
    tokenService.remove();
    toast.error("token Expired:");
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.patch("/users/profile/update", data);
      set({ authUser: res.data });
      toast.success("Username updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateProfilePicture: async (image) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.post("/upload/profile-pic", image, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile Image updated successfully");
      return res.data.imageUrl;
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  subscribeToMessages: () => {
    const socket = get().socket;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const selectedUser = useChatStore.getState().selectedUser;
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser?.id;

      if (!isMessageSentFromSelectedUser) {
        toast(`New message from @${newMessage.sender.username}`, {
          icon: "🔔",
        });
      } else {
        useChatStore.setState((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
