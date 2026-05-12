"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { graphAPI, movieAPI } from "../config/api";

interface Movie {
  _id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  synopsis: string;
  poster?: string;
  runtime?: number;
  avgRating: number;
  totalRatings: number;
}

interface SimilarMovie {
  title: string;
  sharedGenres: string[];
  overlap: number;
  poster?: string;
  year?: number;
  avgRating?: number;
}

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  onSelectMovie?: (movie: Movie) => void;
  currentUser?: string;
}

export default function MovieDetailModal({ isOpen, onClose, movie, onSelectMovie, currentUser }: MovieDetailModalProps) {
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && movie) {
      fetchSimilarMovies(movie.title);
      setUserRating(0);
      setRatingSubmitted(false);
      setHoverRating(0);
    }
    return () => setSimilarMovies([]);
  }, [isOpen, movie?.title]);

  const handleRate = async (score: number) => {
    if (!currentUser || !movie) return;
    setUserRating(score);
    try {
      await graphAPI.rateMovie(currentUser, movie.title, score);
      setRatingSubmitted(true);
    } catch { /* ignore */ }
  };

  const fetchSimilarMovies = async (title: string) => {
    setLoadingSimilar(true);
    try {
      const { data: similar } = await graphAPI.getSimilarMovies(title);

      if (similar.length > 0) {
        const titles = similar.map((s: SimilarMovie) => s.title);
        const { data: movieDetails } = await movieAPI.getByTitles(titles);

        const enriched = similar.map((s: SimilarMovie) => {
          const detail = movieDetails.find((m: Movie) => m.title === s.title);
          return {
            ...s,
            poster: detail?.poster,
            year: detail?.year,
            avgRating: detail?.avgRating,
          };
        });
        setSimilarMovies(enriched);
      } else {
        setSimilarMovies([]);
      }
    } catch {
      setSimilarMovies([]);
    }
    setLoadingSimilar(false);
  };

  const handleSimilarClick = async (title: string) => {
    try {
      const { data: movies } = await movieAPI.getByTitles([title]);
      if (movies.length > 0 && onSelectMovie) {
        onSelectMovie(movies[0]);
      }
    } catch { /* ignore */ }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#2a2420] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#3d352c]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/40 rounded-full p-1.5 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Hero */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3d352c] to-[#16130e]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a2420] via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
            <div className="w-28 h-40 rounded-lg overflow-hidden flex-shrink-0 shadow-xl bg-[#16130e]">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white leading-tight">{movie.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-[#a89880]">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.director}</span>
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <span>{movie.runtime} min</span>
                  </>
                )}
              </div>
              {movie.totalRatings > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <StarIcon className="w-5 h-5 text-[#c49148]" />
                  <span className="text-white font-semibold">{movie.avgRating?.toFixed(1)}</span>
                  <span className="text-[#a89880] text-sm">({movie.totalRatings} ratings)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Genres */}
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre} className="bg-[#c49148]/20 text-[#d4a050] text-xs px-3 py-1 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Rate Movie */}
          {currentUser && (
            <div>
              <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-2">Your Rating</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= (hoverRating || userRating);
                  return (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRate(star)}
                      className="transition-transform hover:scale-125"
                    >
                      {filled ? (
                        <StarIcon className="w-8 h-8 text-[#c49148]" />
                      ) : (
                        <StarOutline className="w-8 h-8 text-[#3d352c] hover:text-[#c49148]/50" />
                      )}
                    </button>
                  );
                })}
                {userRating > 0 && (
                  <span className="ml-3 text-sm text-[#a89880]">
                    {ratingSubmitted ? (
                      <span className="text-[#34A853]">Rated {userRating}/5</span>
                    ) : (
                      "Saving..."
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {movie.synopsis && (
            <div>
              <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-2">Synopsis</h3>
              <p className="text-white/80 text-sm leading-relaxed">{movie.synopsis}</p>
            </div>
          )}

          {/* Similar Movies */}
          <div>
            <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Similar Movies</h3>
            {loadingSimilar ? (
              <p className="text-[#a89880] text-sm">Loading...</p>
            ) : similarMovies.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {similarMovies.map((sim) => (
                  <div
                    key={sim.title}
                    onClick={() => handleSimilarClick(sim.title)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#16130e] relative transition-transform group-hover:scale-[1.05]">
                      {sim.poster ? (
                        <img src={sim.poster} alt={sim.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🎬</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                        {sim.avgRating && (
                          <div className="flex items-center gap-0.5">
                            <StarIcon className="w-3 h-3 text-[#c49148]" />
                            <span className="text-white text-[10px] font-semibold">{sim.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-white text-xs mt-1.5 truncate group-hover:text-[#d4a050] transition-colors">{sim.title}</p>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {sim.sharedGenres.slice(0, 2).map((g) => (
                        <span key={g} className="text-[9px] text-[#a89880]">{g}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#a89880] text-sm">No similar movies found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
