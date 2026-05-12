"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { movieAPI } from '../config/api';

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
      const { data } = await movieAPI.getTopRated();
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
      {selectedMovie && (
        <div className="relative rounded-2xl overflow-hidden mb-6 h-80 bg-[#16130e]">
          {selectedMovie.poster && (
            <img
              src={selectedMovie.poster}
              alt={selectedMovie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c1914] via-[#1c1914]/85 via-50% to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1914]/60 to-transparent z-10" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-10" />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
            <div style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)' }}>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>Standout Films: TOP RATED</h2>
              <p className="text-sm" style={{ color: '#d4ccc4' }}>Highest rated films by our community</p>
            </div>
            <div className="max-w-[55%]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#c49148] text-xs px-2 py-1 rounded-full font-medium" style={{ color: '#ffffff' }}>Top Rated</span>
                {selectedMovie.genres?.[0] && (
                  <span className="bg-[#c48b61] text-xs px-2 py-1 rounded-full font-medium" style={{ color: '#ffffff' }}>
                    {selectedMovie.genres[0]}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>{selectedMovie.title}</h3>
              <p className="mb-4 line-clamp-2" style={{ color: '#d4ccc4' }}>{selectedMovie.synopsis}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5" style={{ color: '#c49148' }} />
                  <span className="font-semibold" style={{ color: '#ffffff' }}>{selectedMovie.avgRating?.toFixed(1) || "N/A"}</span>
                  <span className="text-sm" style={{ color: '#d4ccc4' }}>({selectedMovie.totalRatings || 0} ratings)</span>
                </div>
                <span style={{ color: '#d4ccc4' }}>•</span>
                <span style={{ color: '#d4ccc4' }}>{selectedMovie.year}</span>
                <span style={{ color: '#d4ccc4' }}>•</span>
                <span style={{ color: '#d4ccc4' }}>{selectedMovie.director}</span>
              </div>
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
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
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