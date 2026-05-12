"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { authAPI } from '../config/api';
import axios from 'axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authAPI.login(username, password);
      onLoginSuccess(data.username);
      resetForm();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Could not connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authAPI.register(username, email, password);
      onLoginSuccess(data.username);
      resetForm();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Could not connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#2a2420] rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-[#3d352c]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a89880] hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[#a89880] text-sm mt-1">
            {mode === "login" ? "Sign in to your account" : "Join the community"}
          </p>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[#a89880] text-sm block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors"
                placeholder="Enter email"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[#a89880] text-sm block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-[#a04030] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c49148] hover:bg-[#a07838] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Log In" : "Register"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#3d352c]" />
            <span className="text-[#a89880] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#3d352c]" />
          </div>

          <button
            type="button"
            onClick={() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
              window.location.href = `${apiUrl}/api/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="w-full text-[#a89880] hover:text-[#d4a050] text-sm transition-colors"
          >
            {mode === "login" ? "Register" : "Already have an account? Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
