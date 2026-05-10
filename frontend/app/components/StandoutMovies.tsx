"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { moviePosters } from "../lib/moviePosters";

interface Movie {
  _id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  synopsis: string;
  poster?: string;
  avgRating: number;
  totalRatings: number;
}

export default function StandoutMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetchTopMovies();
  }, []);

  const fetchTopMovies = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/movies/top");
      const data = await res.json();
      setMovies(data);
      if (data.length > 0) {
        setSelectedMovie(data[0]);
      }
    } catch (error) {
      console.error("Error fetching top movies:", error);
    }
  };

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Standout Films: TOP RATED</h2>
        <p className="text-sm text-[#a89880]">Highest rated films by our community</p>
      </div>

      {selectedMovie && (
        <div className="relative rounded-2xl overflow-hidden mb-6 h-64 bg-gradient-to-r from-[#2a2420] to-[#16130e]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c1914] via-transparent to-transparent z-10" />
          {moviePosters[selectedMovie.title] && (
            <img
              src={moviePosters[selectedMovie.title]}
              alt={selectedMovie.title}
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#c49148] text-white text-xs px-2 py-1 rounded-full font-medium">Top Rated</span>
              {selectedMovie.genres?.[0] && (
                <span className="bg-[#c48b61] text-white text-xs px-2 py-1 rounded-full font-medium">
                  {selectedMovie.genres[0]}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h3>
            <p className="text-[#a89880] mb-4 max-w-lg line-clamp-2">{selectedMovie.synopsis}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-[#c49148]" />
                <span className="text-white font-semibold">{selectedMovie.avgRating?.toFixed(1) || "N/A"}</span>
                <span className="text-[#a89880] text-sm">({selectedMovie.totalRatings || 0} ratings)</span>
              </div>
              <span className="text-[#a89880]">•</span>
              <span className="text-[#a89880]">{selectedMovie.year}</span>
              <span className="text-[#a89880]">•</span>
              <span className="text-[#a89880]">{selectedMovie.director}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {movies.map((movie, index) => (
          <div
            key={movie._id}
            onClick={() => setSelectedMovie(movie)}
            className={`flex-shrink-0 w-44 cursor-pointer group transition-transform hover:scale-105 ${
              selectedMovie?._id === movie._id ? "ring-2 ring-[#c49148] rounded-xl" : ""
            }`}
          >
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-[#2a2420]">
              {moviePosters[movie.title] ? (
                <img src={moviePosters[movie.title]} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-[#a89880]">🎬</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                #{index + 1}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-[#c49148]" />
                  <span className="text-white text-sm font-semibold">{movie.avgRating?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-white font-medium text-sm truncate group-hover:text-[#d4a050]">{movie.title}</h4>
              <p className="text-[#a89880] text-xs">{movie.year}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}