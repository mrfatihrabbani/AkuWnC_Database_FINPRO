"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FriendsBar from "./components/FriendsBar";
import StandoutMovies from "./components/StandoutMovies";
import RecommendedMovies from "./components/RecommendedMovies";
import PopularReviews from "./components/PopularReviews";
import GenreStats from "./components/GenreStats";
import FilmsPage from "./components/FilmsPage";
import LoginModal from "./components/LoginModal";
import ProfilePage from "./components/ProfilePage";
import { userAPI } from './config/api';

const pageTitles: Record<string, string> = {
  home: "Home",
  films: "Films",
  profile: "Profile",
  members: "Members",
  reviews: "Reviews",
  watchlist: "Watchlist",
  stats: "Stats",
  more: "More",
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [activePage, setActivePage] = useState("home");
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      setCurrentUser(saved);
      fetchAvatar(saved);
    }
  }, []);

  const handleViewProfile = (username: string) => {
    setViewingUser(username);
    setActivePage("profile");
  };

  const fetchAvatar = useCallback(async (username: string) => {
    try {
      const { data } = await userAPI.getProfile(username);
      setUserAvatar(data.avatar || null);
    } catch { /* ignore */ }
  }, []);

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("currentUser", username);
    fetchAvatar(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserAvatar(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <div className="flex min-h-screen bg-[#1c1914]">
      <Sidebar activeItem={activePage} onItemChange={setActivePage} />

      <div className="flex-1 ml-20 min-w-0 overflow-hidden">
        <Header
          currentUser={currentUser}
          userAvatar={userAvatar}
          pageTitle={pageTitles[activePage] || "Home"}
          onNavigate={(page) => { setActivePage(page); if (page === "profile") setViewingUser(null); }}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {activePage === "home" && (
          <main className="p-6">
            {currentUser && <FriendsBar currentUser={currentUser} onViewProfile={handleViewProfile} />}

            <StandoutMovies />

            {currentUser && <RecommendedMovies currentUser={currentUser} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <PopularReviews />
              </div>
              <div>
                <GenreStats />
              </div>
            </div>
          </main>
        )}

        {activePage === "films" && <FilmsPage />}
        {activePage === "profile" && currentUser && (
          <ProfilePage
            username={viewingUser || currentUser}
            currentUser={currentUser}
            onAvatarChange={() => fetchAvatar(currentUser)}
            onViewProfile={handleViewProfile}
          />
        )}
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}