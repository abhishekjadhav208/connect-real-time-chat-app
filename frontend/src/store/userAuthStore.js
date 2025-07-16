import { create } from "zustand";
import { axiosInstanace } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5002" : "/";

export const userAuthStore = create((set,get) => ({
  authUser: null,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isSigningUp: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async (data) => {
    try {
      const res = await axiosInstanace.get("/auth/check");
      set({authUser:res.data});
      get().connectSocket();
    } catch (error) {
      console.log("error in the my userauthstore", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    console.log(data);
    try {
      const res = await axiosInstanace.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully")
    } catch (error) {
      console.log("error in the userauthstore", error);
    }
  },

  login: async (data)=>{
    set({isLoggingIn:true})
      try {
        const res = await axiosInstanace.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      } catch (error) {
          console.log("login error:", error);
      }finally{
        set({ isLoggingIn: false});
      }
  },

  logout: async ()=>{
     try {
      await axiosInstanace.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
    updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstanace.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
      get().disconnectSocket();
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
        userId: authUser._id,
      },
    });
    socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);
});

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect("disconnect", () => {
  console.log("❌ Disconnected from socket");
});
  },
}));
