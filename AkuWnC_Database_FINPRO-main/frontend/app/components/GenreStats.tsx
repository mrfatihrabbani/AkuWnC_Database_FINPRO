"use client";

import { useState, useEffect } from "react";

interface GenreStat {
  _id: string;
  avgRating: number;
  totalMovies: number;
}

export default function GenreStats() {
  const [genreStats, setGenreStats] = useState<GenreStat[]>([]);

  useEffect(() => {
    fetchGenreStats();
  }, []);

  const fetchGenreStats = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/movies/genre-stats");
      const data = await res.json();
      setGenreStats(data.slice(0, 8));
    } catch (error) {
      console.error("Error fetching genre stats:", error);
    }
  };

  const genreColors: Record<string, string> = {
    Documentary: "#c49148",
    Animation: "#d4a050",
    Drama: "#c48b61",
    Music: "#e040fb",
    Horror: "#f44336",
    Action: "#ff5722",
    Adventure: "#4caf50",
    Comedy: "#ffeb3b",
    "Science Fiction": "#2196f3",
    Fantasy: "#9c27b0",
    Crime: "#607d8b",
    Thriller: "#795548",
    History: "#8d6e63",
    War: "#455a64",
    Romance: "#e91e63",
    Family: "#03a9f4",
    Mystery: "#673ab7",
    Western: "#ff9800",
  };

  return (
    <section className="bg-[#16130e] rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Genre Ratings</h2>
      <p className="text-sm text-[#a89880] mb-6">Average community rating by genre</p>

      <div className="space-y-4">
        {genreStats.map((genre) => (
          <div key={genre._id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white text-sm font-medium">{genre._id}</span>
              <span className="text-[#a89880] text-sm">
                {genre.avgRating.toFixed(1)} • {genre.totalMovies} films
              </span>
            </div>
            <div className="h-2 bg-[#2a2420] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(genre.avgRating / 5) * 100}%`,
                  backgroundColor: genreColors[genre._id] || "#c49148",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {genreStats.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#a89880]">Loading genre statistics...</p>
        </div>
      )}
    </section>
  );
}