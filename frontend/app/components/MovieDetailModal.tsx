"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { EyeIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { EyeIcon as EyeSolid, BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { contentAPI, reviewAPI, movieAPI, graphAPI, watchlistAPI } from "../config/api";

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

interface SimilarMovie {
  title: string;
  sharedGenres: string[];
  overlap: number;
  poster?: string;
  year?: number;
  avgRating?: number;
}

interface ContentReview {
  _id: string;
  user: { username: string; avatar?: string };
  rating: number;
  content: string;
  likesCount: number;
  createdAt: string;
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
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [watchStatus, setWatchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && movie) {
      fetchSimilarMovies(movie.title);
      fetchReviews(movie._id);
      fetchWatchStatus(movie._id);
      setUserRating(0);
      setRatingSubmitted(false);
      setHoverRating(0);
      setReviewText("");
      setReviewRating(0);
      setShowReviewForm(false);
    }
    return () => { setSimilarMovies([]); setReviews([]); setWatchStatus(null); };
  }, [isOpen, movie?.title]);

  const fetchWatchStatus = async (contentId: string) => {
    if (!currentUser) return;
    try {
      const { data } = await watchlistAPI.status(currentUser, contentId);
      setWatchStatus(data?.status || null);
    } catch { setWatchStatus(null); }
  };

  const handleWatchlist = async (status: 'watched' | 'want_to_watch') => {
    if (!currentUser || !movie) return;
    try {
      if (watchStatus === status) {
        await watchlistAPI.remove(currentUser, movie._id);
        setWatchStatus(null);
      } else {
        await watchlistAPI.add(currentUser, movie._id, status);
        setWatchStatus(status);
      }
    } catch { /* ignore */ }
  };

  const handleRate = async (score: number) => {
    if (!currentUser || !movie) return;
    setUserRating(score);
    try {
      await contentAPI.rate({
        contentId: movie._id,
        score,
        title: movie.title,
        type: movie.type || 'movie',
        username: currentUser,
      });
      setRatingSubmitted(true);
    } catch { /* ignore */ }
  };

  const fetchReviews = async (contentId: string) => {
    try {
      const { data } = await reviewAPI.getForContent(contentId);
      setReviews(data);
    } catch { /* ignore */ }
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !movie || !reviewText.trim() || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      await reviewAPI.create({
        username: currentUser,
        contentId: movie._id,
        rating: reviewRating,
        content: reviewText.trim(),
      });
      setReviewText("");
      setReviewRating(0);
      setShowReviewForm(false);
      fetchReviews(movie._id);
    } catch { /* ignore */ }
    setSubmittingReview(false);
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
          return { ...s, poster: detail?.poster, year: detail?.year, avgRating: detail?.avgRating };
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

        {/* hero */}
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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white leading-tight">{movie.title}</h2>
                {movie.type === 'series' && (
                  <span className="text-xs bg-[#c49148]/20 text-[#d4a050] px-2 py-0.5 rounded">Series</span>
                )}
              </div>
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

          {/* watchlist buttons */}
          {currentUser && (
            <div className="flex gap-3">
              <button
                onClick={() => handleWatchlist('watched')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  watchStatus === 'watched'
                    ? 'bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30'
                    : 'bg-[#16130e] text-[#a89880] hover:text-white border border-[#3d352c]'
                }`}
              >
                {watchStatus === 'watched' ? <EyeSolid className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                {watchStatus === 'watched' ? 'Watched' : 'Mark as Watched'}
              </button>
              <button
                onClick={() => handleWatchlist('want_to_watch')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  watchStatus === 'want_to_watch'
                    ? 'bg-[#c49148]/20 text-[#d4a050] border border-[#c49148]/30'
                    : 'bg-[#16130e] text-[#a89880] hover:text-white border border-[#3d352c]'
                }`}
              >
                {watchStatus === 'want_to_watch' ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                {watchStatus === 'want_to_watch' ? 'On Watchlist' : 'Want to Watch'}
              </button>
            </div>
          )}

          {/* rate */}
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
                    ) : "Saving..."}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* synopsis */}
          {movie.synopsis && (
            <div>
              <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-2">Synopsis</h3>
              <p className="text-white/80 text-sm leading-relaxed">{movie.synopsis}</p>
            </div>
          )}

          {/* reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              {currentUser && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-xs text-[#c49148] hover:text-[#d4a050] transition-colors"
                >
                  {showReviewForm ? "Cancel" : "Write a review"}
                </button>
              )}
            </div>

            {/* review form */}
            {showReviewForm && currentUser && (
              <div className="bg-[#16130e] rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center gap-1">
                  <span className="text-[#a89880] text-sm mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)}>
                      {star <= reviewRating ? (
                        <StarIcon className="w-5 h-5 text-[#c49148]" />
                      ) : (
                        <StarOutline className="w-5 h-5 text-[#3d352c] hover:text-[#c49148]/50" />
                      )}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-[#2a2420] text-white text-sm rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] resize-none h-24"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewText.trim() || reviewRating === 0}
                  className="bg-[#c49148] hover:bg-[#a07838] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </div>
            )}

            {/* reviews list */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((rev) => (
                  <div key={rev._id} className="bg-[#16130e] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          {rev.user?.username?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">{rev.user?.username}</span>
                      <div className="flex ml-auto">
                        {Array.from({ length: Math.floor(rev.rating) }).map((_, i) => (
                          <StarIcon key={i} className="w-3 h-3 text-[#c49148]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#a89880] text-sm">{rev.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#a89880] text-sm">No reviews yet. Be the first!</p>
            )}
          </div>

          {/* similar */}
          <div>
            <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Similar</h3>
            {loadingSimilar ? (
              <p className="text-[#a89880] text-sm">Loading...</p>
            ) : similarMovies.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {similarMovies.map((sim) => (
                  <div key={sim.title} onClick={() => handleSimilarClick(sim.title)} className="cursor-pointer group">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#16130e] relative transition-transform group-hover:scale-[1.05]">
                      {sim.poster ? (
                        <img src={sim.poster} alt={sim.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">🎬</span></div>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#a89880] text-sm">No similar titles found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
