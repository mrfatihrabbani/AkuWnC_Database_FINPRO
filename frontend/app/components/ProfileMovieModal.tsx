"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { contentAPI } from "../config/api";

interface Movie {
  _id: string;
  title: string;
  type?: string;
  year: number;
  director: string;
  genres: string[];
  synopsis: string;
  poster?: string;
  runtime?: number;
  avgRating: number;
  totalRatings: number;
}

interface ProfileMovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInFilms?: (movieId: string) => void;
}

export default function ProfileMovieModal({ movie, isOpen, onClose, onViewInFilms }: ProfileMovieModalProps) {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (isOpen && movie) {
      fetchSimilar(movie._id);
    }
    return () => { setSimilarMovies([]); };
  }, [isOpen, movie?._id]);

  const fetchSimilar = async (id: string) => {
    try {
      const { data } = await contentAPI.getSimilar(id);
      setSimilarMovies(data.slice(0, 4));
    } catch { /* ignore */ }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1c1914] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#3d352c]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#2a2420] hover:bg-[#3d352c] text-white z-10"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* poster */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#2a2420]">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
              )}
            </div>
          </div>

          {/* info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
                {movie.type && (
                  <span className="text-[10px] bg-[#c49148]/20 text-[#d4a050] px-2 py-0.5 rounded-full uppercase">
                    {movie.type}
                  </span>
                )}
              </div>
              <p className="text-[#a89880]">
                {movie.year} • {movie.director}
                {movie.runtime ? ` • ${movie.runtime} min` : ""}
              </p>
            </div>

            {/* rating */}
            <div className="flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-[#c49148]" />
              <span className="text-white font-semibold">{movie.avgRating?.toFixed(1) || "N/A"}</span>
              <span className="text-[#a89880] text-sm">({movie.totalRatings} ratings)</span>
            </div>

            {/* synopsis */}
            {movie.synopsis && (
              <p className="text-[#a89880] leading-relaxed">{movie.synopsis}</p>
            )}

            {/* genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre} className="bg-[#c49148]/20 text-[#d4a050] text-xs px-3 py-1 rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* view in films button */}
            {onViewInFilms && (
              <button
                onClick={() => onViewInFilms(movie._id)}
                className="mt-4 px-6 py-3 bg-[#c49148] hover:bg-[#d4a050] text-white font-medium rounded-lg transition-colors"
              >
                View Full Details in Films
              </button>
            )}
          </div>
        </div>

        {/* similar movies */}
        {similarMovies.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Similar</h3>
            <div className="grid grid-cols-4 gap-3">
              {similarMovies.map((m) => (
                <div key={m._id} className="group cursor-pointer">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2420]">
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                    )}
                  </div>
                  <p className="text-white text-xs mt-1 truncate">{m.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
