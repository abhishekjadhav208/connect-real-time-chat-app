

import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import { userAuthStore } from "./store/userAuthStore";
import {Loader} from 'lucide-react'
import toast, { Toaster,ToastBar} from 'react-hot-toast'
import { useThemeStore } from "./store/useThemeStore";
function App() {
  const [count, setCount] = useState(0);
  const { authUser, checkAuth, isCheckingAuth } = userAuthStore();
    const { theme } = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  

  if (isCheckingAuth && !authUser) {
    return (
        <div className="flex item-center justify-center h-screen">
          <Loader className="size-10 animate-spin" />
        </div>
    )
  }
  return (
    <div data-theme={theme}>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={authUser?<Home />:<Navigate to="/login" />} />
        <Route path="/signup" element={!authUser?<SignupPage />:<Navigate to="/" />} />
        <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/" />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/profile" element={authUser?<ProfilePage />:<Navigate to="/login" />} />
      </Routes>
      <Toaster>
  {(t) => (
    <ToastBar
      toast={t}
      style={{
        ...t.style,
        animation: t.visible
          ? 'custom-enter 1s ease'
          : 'custom-exit 1s ease forwards',
      }}
    />
  )}
</Toaster>


    </div>
  )
}

export default App;
