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
      const { data } = await authAPI.login(email, password);
      onLoginSuccess(data.user.username);
      resetForm();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
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
      await authAPI.register(username, email, password);
      // auto-login after register
      const { data } = await authAPI.login(email, password);
      onLoginSuccess(data.user.username);
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
          {mode === "register" && (
            <div>
              <label className="text-[#a89880] text-sm block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors"
                placeholder="Choose a username"
                required
              />
            </div>
          )}

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
