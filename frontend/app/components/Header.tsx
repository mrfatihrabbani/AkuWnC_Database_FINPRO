"use client";

import { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import { contentAPI, notificationAPI, themeAPI } from '../config/api';

interface Notification {
  _id: string;
  type: 'NEW_FOLLOWER' | 'RECOMMENDATION' | 'TAGGED' | 'COMMENT';
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

interface SearchResult {
  _id: string;
  title: string;
  type: string;
  year: number;
  director: string;
  poster?: string;
}

interface HeaderProps {
  currentUser: string | null;
  userAvatar?: string | null;
  pageTitle?: string;
  onNavigate?: (page: string) => void;
  onSelectMovie?: (movie: SearchResult) => void;
  onViewProfile?: (username: string) => void;
  onNotifReviewClick?: (reviewId: string) => void;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Header({ currentUser, userAvatar, pageTitle = "Home", onNavigate, onSelectMovie, onViewProfile, onNotifReviewClick, onLogin, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const settingsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    try { await themeAPI.toggle(); } catch { /* ignore */ }
  };

  // close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fetch notifications when bell is opened
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const { data } = await notificationAPI.getForUser(currentUser);
      setNotifications(data);
    } catch { /* ignore */ }
  };

  const handleBellClick = () => {
    if (!currentUser) return;
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) fetchNotifications();
  };

  const handleClearNotifications = async () => {
    if (!currentUser) return;
    try {
      await notificationAPI.clearAll(currentUser);
      setNotifications([]);
    } catch { /* ignore */ }
  };

  const handleNotifClick = async (notif: Notification) => {
    setShowNotifications(false);
    if (!notif.read) {
      setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, read: true } : n));
      try { await notificationAPI.markAsRead(notif._id); } catch { /* ignore */ }
    }
    // get the username from the notif message (first word)
    const username = notif.message.split(' ')[0];

    if (notif.type === 'NEW_FOLLOWER' && onViewProfile) {
      onViewProfile(username);
    } else if (notif.type === 'COMMENT' && notif.relatedId && onNotifReviewClick) {
      onNotifReviewClick(notif.relatedId);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER': return '👤';
      case 'RECOMMENDATION': return '🎬';
      case 'TAGGED': return '🏷️';
      case 'COMMENT': return '💬';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await contentAPI.search(query);
      setSearchResults(data.slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectMovie = (movie: SearchResult) => {
    setSearchQuery("");
    setSearchResults([]);
    if (onSelectMovie) onSelectMovie(movie);
    else if (onNavigate) onNavigate("films");
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
                  onClick={() => handleSelectMovie(movie)}
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
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{movie.title}</p>
                      {movie.type === 'series' && (
                        <span className="text-[10px] bg-[#c49148]/20 text-[#d4a050] px-1.5 py-0.5 rounded">Series</span>
                      )}
                    </div>
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
                    <div className="border-t border-[#3d352c]" />
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#3d352c] transition-colors"
                    >
                      {theme === "dark" ? (
                        <SunIcon className="w-5 h-5 text-[#c49148]" />
                      ) : (
                        <MoonIcon className="w-5 h-5 text-[#a89880]" />
                      )}
                      {theme === "dark" ? "Orange Tabby" : "White Persian"}
                    </button>
                  </>
                ) : (
                  <>
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
                    <div className="border-t border-[#3d352c]" />
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#3d352c] transition-colors"
                    >
                      {theme === "dark" ? (
                        <SunIcon className="w-5 h-5 text-[#c49148]" />
                      ) : (
                        <MoonIcon className="w-5 h-5 text-[#a89880]" />
                      )}
                      {theme === "dark" ? "Orange Tabby" : "White Persian"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 text-[#a89880] hover:text-white transition-colors"
            >
              {notifications.length > 0 ? (
                <BellAlertIcon className="w-6 h-6 text-[#c49148]" />
              ) : (
                <BellIcon className="w-6 h-6" />
              )}
              {currentUser && notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#c48b61] rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifications && currentUser && (
              <div className="absolute right-0 top-full mt-2 bg-[#2a2420] rounded-xl shadow-xl overflow-hidden z-50 w-80">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d352c]">
                  <span className="text-white font-semibold text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[#a89880] text-xs hover:text-[#c49148] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotifClick(notif)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#3d352c] transition-colors border-b border-[#3d352c]/50 last:border-0 cursor-pointer"
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notif.read ? 'text-[#a89880]' : 'text-white'}`}>{notif.message}</p>
                          <p className="text-[#a89880] text-xs mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.read && <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-2" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <BellIcon className="w-8 h-8 text-[#3d352c] mx-auto mb-2" />
                      <p className="text-[#a89880] text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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