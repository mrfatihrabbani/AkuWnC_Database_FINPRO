"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { FunnelIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { contentAPI } from '../config/api';
import MovieDetailModal from './MovieDetailModal';

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

const PER_PAGE = 20;

interface FilmsPageProps {
  currentUser?: string | null;
  initialMovieId?: string | null;
  onClearInitialMovie?: () => void;
}

export default function FilmsPage({ currentUser, initialMovieId, onClearInitialMovie }: FilmsPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [contentType, setContentType] = useState<"movie" | "series">("movie");
  const [sortBy, setSortBy] = useState<"title" | "year" | "rating">("title");
  const [filterGenre, setFilterGenre] = useState<string>("All");
  const [genres, setGenres] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchContent(1);
  }, [contentType, sortBy, filterGenre]);

  useEffect(() => {
    if (initialMovieId) {
      contentAPI.getById(initialMovieId).then(({ data }) => {
        setSelectedMovie(data);
      }).catch(() => {});
      if (onClearInitialMovie) onClearInitialMovie();
    }
  }, [initialMovieId]);

  const fetchContent = async (p: number) => {
    setLoading(true);
    try {
      const { data } = await contentAPI.browse({
        type: contentType,
        genre: filterGenre,
        sortBy,
        page: p,
        perPage: PER_PAGE,
      });
      if (p === 1) {
        setMovies(data.items);
      } else {
        setMovies((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
      setHasMore(data.hasNextPage);

      if (p === 1) {
        const allGenres = new Set<string>();
        data.items.forEach((m: Movie) => m.genres?.forEach((g: string) => allGenres.add(g)));
        setGenres((prev) => {
          const merged = new Set([...prev, ...allGenres]);
          return Array.from(merged).sort();
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMore = () => {
    const next = page + 1;
    setPage(next);
    fetchContent(next);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Browse</h1>
        <p className="text-[#a89880]">
          {total} {contentType === 'movie' ? 'films' : 'series'} in the collection
        </p>
      </div>

      {/* type tabs */}
      <div className="flex gap-1 mb-6 bg-[#2a2420] rounded-xl p-1 w-fit">
        <button
          onClick={() => setContentType("movie")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            contentType === "movie" ? "bg-[#c49148] text-white" : "text-[#a89880] hover:text-white"
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => setContentType("series")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            contentType === "series" ? "bg-[#c49148] text-white" : "text-[#a89880] hover:text-white"
          }`}
        >
          Series
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowFilterDropdown(false);
            }}
            className="flex items-center gap-2 bg-[#2a2420] text-white px-4 py-2.5 rounded-lg hover:bg-[#3d352c] transition-colors text-sm"
          >
            <span className="text-[#a89880]">Sort by:</span>
            <span className="font-medium capitalize">{sortBy}</span>
            <ChevronDownIcon className="w-4 h-4 text-[#a89880]" />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-[#2a2420] rounded-lg shadow-xl overflow-hidden z-30 min-w-[160px]">
              {(["title", "year", "rating"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#3d352c] transition-colors capitalize ${
                    sortBy === option ? "text-[#c49148] font-medium" : "text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowSortDropdown(false);
            }}
            className="flex items-center gap-2 bg-[#2a2420] text-white px-4 py-2.5 rounded-lg hover:bg-[#3d352c] transition-colors text-sm"
          >
            <FunnelIcon className="w-4 h-4 text-[#a89880]" />
            <span className="text-[#a89880]">Genre:</span>
            <span className="font-medium">{filterGenre}</span>
            <ChevronDownIcon className="w-4 h-4 text-[#a89880]" />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-[#2a2420] rounded-lg shadow-xl overflow-hidden z-30 min-w-[180px] max-h-[320px] overflow-y-auto">
              <button
                onClick={() => { setFilterGenre("All"); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#3d352c] transition-colors ${
                  filterGenre === "All" ? "text-[#c49148] font-medium" : "text-white"
                }`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => { setFilterGenre(genre); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#3d352c] transition-colors ${
                    filterGenre === genre ? "text-[#c49148] font-medium" : "text-white"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto text-sm text-[#a89880]">
          Showing {movies.length} of {total}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="group cursor-pointer" onClick={() => setSelectedMovie(movie)}>
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-[#2a2420] transition-transform group-hover:scale-[1.03]">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3">
                  <span className="text-4xl">🎬</span>
                  <span className="text-[#a89880] text-xs text-center leading-tight">{movie.title}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-[#a89880] text-xs line-clamp-3 mb-2">{movie.synopsis}</p>
                <div className="flex flex-wrap gap-1">
                  {movie.genres?.slice(0, 3).map((genre: string) => (
                    <span key={genre} className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {movie.totalRatings > 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-[#c49148]" />
                    <span className="text-white text-sm font-semibold">{movie.avgRating?.toFixed(1)}</span>
                    <span className="text-[#a89880] text-xs">({movie.totalRatings})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2.5">
              <h4 className="text-white font-medium text-sm truncate group-hover:text-[#d4a050] transition-colors">
                {movie.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#a89880] text-xs">{movie.year}</span>
                <span className="text-[#a89880] text-xs">•</span>
                <span className="text-[#a89880] text-xs truncate">{movie.director}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-[#a89880] text-lg">
            No {contentType === 'movie' ? 'films' : 'series'} found{filterGenre !== 'All' ? ` for genre "${filterGenre}"` : ''}
          </p>
          {filterGenre !== 'All' && (
            <button onClick={() => setFilterGenre("All")} className="mt-3 text-[#d4a050] hover:underline text-sm">
              Clear filter
            </button>
          )}
        </div>
      )}

      {loading && movies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#a89880] text-lg">Loading...</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={handleSeeMore}
            disabled={loading}
            className="flex items-center gap-2 bg-[#c49148] hover:bg-[#a07838] text-white font-medium px-8 py-3 rounded-full transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Loading..." : "See More"}
          </button>
        </div>
      )}

      <MovieDetailModal
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie}
        onSelectMovie={(m) => setSelectedMovie(m)}
        currentUser={currentUser || undefined}
      />
    </div>
  );
}
