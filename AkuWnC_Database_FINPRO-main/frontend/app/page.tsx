"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FriendsBar from "./components/FriendsBar";
import StandoutMovies from "./components/StandoutMovies";
import RecommendedMovies from "./components/RecommendedMovies";
import PopularReviews from "./components/PopularReviews";
import GenreStats from "./components/GenreStats";
import FilmsPage from "./components/FilmsPage";

const pageTitles: Record<string, string> = {
  home: "Home",
  films: "Films",
  members: "Members",
  reviews: "Reviews",
  watchlist: "Watchlist",
  stats: "Stats",
  more: "More",
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activePage, setActivePage] = useState("home");

  const handleLogin = () => {
    setCurrentUser("fatih");
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="flex min-h-screen bg-[#1c1914]">
      <Sidebar activeItem={activePage} onItemChange={setActivePage} />

      <div className="flex-1 ml-20">
        <Header
          currentUser={currentUser}
          pageTitle={pageTitles[activePage] || "Home"}
          onNavigate={setActivePage}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {activePage === "home" && (
          <main className="p-6">
            {currentUser && <FriendsBar currentUser={currentUser} />}

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
      </div>
    </div>
  );
}