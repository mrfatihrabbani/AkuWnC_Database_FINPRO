"use client";

import { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface SearchResult {
  _id: string;
  title: string;
  year: number;
  director: string;
  poster?: string;
}

interface HeaderProps {
  currentUser: string | null;
  userAvatar?: string | null;
  pageTitle?: string;
  onNavigate?: (page: string) => void;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Header({ currentUser, userAvatar, pageTitle = "Home", onNavigate, onLogin, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/movies/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectMovie = () => {
    setSearchQuery("");
    setSearchResults([]);
    if (onNavigate) onNavigate("films");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1c1914]/95 backdrop-blur-sm border-b border-[#3d352c]">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>

        <div className="relative flex-1 max-w-xl mx-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a89880]" />
            <input
              type="text"
              placeholder="Search films, directors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#3d352c] text-white placeholder-[#a89880] rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#c49148]"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2420] rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.map((movie) => (
                <div
                  key={movie._id}
                  onClick={handleSelectMovie}
                  className="flex items-center gap-3 p-3 hover:bg-[#3d352c] cursor-pointer"
                >
                  <div className="w-10 h-14 bg-[#16130e] rounded overflow-hidden flex-shrink-0">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a89880] text-xs">🎬</div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{movie.title}</p>
                    <p className="text-[#a89880] text-sm">{movie.year} • {movie.director}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-[#a89880] hover:text-white transition-colors"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 bg-[#2a2420] rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        if (onNavigate) onNavigate("profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#3d352c] transition-colors"
                    >
                      <UserCircleIcon className="w-5 h-5 text-[#a89880]" />
                      Profile
                    </button>
                    <div className="border-t border-[#3d352c]" />
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#a04030] hover:bg-[#3d352c] transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      if (onLogin) onLogin();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#3d352c] transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#c49148]" />
                    Log In
                  </button>
                )}
              </div>
            )}
          </div>

          <button className="relative p-2 text-[#a89880] hover:text-white transition-colors">
            <BellIcon className="w-6 h-6" />
            {currentUser && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#c48b61] rounded-full" />
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3 bg-[#2a2420] rounded-full py-2 px-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={currentUser} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{currentUser[0].toUpperCase()}</span>
                )}
              </div>
              <span className="text-white font-medium capitalize">{currentUser}</span>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-[#2a2420] hover:bg-[#3d352c] rounded-full py-2 px-4 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#c49148]" />
              <span className="text-white font-medium">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}