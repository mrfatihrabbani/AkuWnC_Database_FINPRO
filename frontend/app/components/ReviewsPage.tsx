"use client";

import { useState, useEffect, useRef } from "react";
import { StarIcon, HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { reviewAPI, contentAPI } from "../config/api";
import ProfileMovieModal from "./ProfileMovieModal";
import ReviewComments from "./ReviewComments";

interface ReviewUser {
  _id: string;
  username: string;
  avatar?: string;
}

interface ReviewContent {
  _id: string;
  title: string;
  poster?: string;
}

interface Review {
  _id: string;
  user: ReviewUser;
  contentId: ReviewContent;
  rating: number;
  content: string;
  likesCount: number;
  likedBy: string[];
  isFirstWatch: boolean;
  containsSpoilers: boolean;
  createdAt: string;
}

interface ReviewsPageProps {
  currentUser?: string | null;
  onViewProfile?: (username: string) => void;
  highlightReviewId?: string | null;
  onClearHighlight?: () => void;
}

interface MoviePreview {
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

export default function ReviewsPage({ currentUser, onViewProfile, highlightReviewId, onClearHighlight }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"popular" | "mine">("popular");
  const [previewMovie, setPreviewMovie] = useState<MoviePreview | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (highlightReviewId) {
      setActiveTab("mine");
      setBlinking(true);
    }
  }, [highlightReviewId]);

  useEffect(() => {
    if (highlightReviewId && !loading && reviews.length > 0) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      // stop blink after 2s
      const timer = setTimeout(() => setBlinking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightReviewId, loading, reviews]);

  // reset highlight when user switch tab
  useEffect(() => {
    if (onClearHighlight) onClearHighlight();
    setBlinking(false);
  }, [activeTab]);

  const handleMovieClick = async (contentId: string) => {
    try {
      const { data } = await contentAPI.getById(contentId);
      setPreviewMovie(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab, currentUser]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (activeTab === "mine" && currentUser) {
        const { data } = await reviewAPI.getForUser(currentUser);
        setReviews(data);
      } else {
        const { data } = await reviewAPI.getPopular(20);
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!currentUser) return;
    try {
      await reviewAPI.toggleLike(reviewId, currentUser);
      fetchReviews();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-[#c49148]" />);
      } else if (i === full && rating % 1 >= 0.5) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-[#c49148] opacity-50" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-[#3d352c]" />);
      }
    }
    return stars;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Reviews</h1>
        <p className="text-sm text-[#a89880]">See what the community thinks</p>
      </div>

      {/* tabs */}
      <div className="flex gap-1 mb-6 bg-[#2a2420] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("popular")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "popular"
              ? "bg-[#c49148] text-white"
              : "text-[#a89880] hover:text-white"
          }`}
        >
          Popular
        </button>
        {currentUser && (
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "mine"
                ? "bg-[#c49148] text-white"
                : "text-[#a89880] hover:text-white"
            }`}
          >
            My Reviews
          </button>
        )}
      </div>

      {/* reviews list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#a89880]">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#2a2420] rounded-2xl p-12 text-center">
          <p className="text-[#a89880] text-lg mb-2">
            {activeTab === "mine" ? "You haven't written any reviews yet" : "No reviews yet"}
          </p>
          <p className="text-[#a89880] text-sm">
            {activeTab === "mine"
              ? "Watch a film and share your thoughts!"
              : "Be the first to share your thoughts!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              ref={review._id === highlightReviewId ? highlightRef : undefined}
              className={`rounded-xl p-5 transition-colors ${
                review._id === highlightReviewId
                  ? `bg-[#2a2420] ring-2 ring-[#c49148]${blinking ? ' animate-pulse' : ''}`
                  : 'bg-[#16130e] hover:bg-[#2a2420]'
              }`}
            >
              <div className="flex gap-4">
                {/* poster */}
                <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#2a2420] cursor-pointer" onClick={() => review.contentId?._id && handleMovieClick(review.contentId._id)}>
                  {review.contentId?.poster ? (
                    <img
                      src={review.contentId.poster}
                      alt={review.contentId.title}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                </div>

                {/* review content */}
                <div className="flex-1 min-w-0">
                  {/* user + movie */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <button
                      onClick={() => review.user?.username && onViewProfile?.(review.user.username)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {review.user?.avatar ? (
                          <img src={review.user.avatar} alt={review.user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xs">
                            {review.user?.username?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span className="text-white font-medium text-sm">{review.user?.username || "Unknown"}</span>
                    </button>
                    <span className="text-[#a89880] text-sm">reviewed</span>
                    <span className="text-[#d4a050] font-medium text-sm truncate">
                      {review.contentId?.title || "Unknown"}
                    </span>
                  </div>

                  {/* rating + badges */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-white text-sm font-semibold">{review.rating}/5</span>
                    {review.isFirstWatch && (
                      <span className="text-[#a89880] text-xs bg-[#2a2420] px-2 py-0.5 rounded-full">First Watch</span>
                    )}
                    {review.containsSpoilers && (
                      <span className="text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded-full">Spoilers</span>
                    )}
                  </div>

                  {/* review text */}
                  <p className="text-[#a89880] text-sm leading-relaxed mb-3">
                    {review.content}
                  </p>

                  {/* actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(review._id)}
                      className="flex items-center gap-1.5 text-sm transition-colors group"
                    >
                      {currentUser && review.likedBy?.includes(currentUser) ? (
                        <HeartIcon className="w-4 h-4 text-[#c48b61]" />
                      ) : (
                        <HeartOutline className="w-4 h-4 text-[#a89880] group-hover:text-[#c48b61]" />
                      )}
                      <span className={currentUser && review.likedBy?.includes(currentUser) ? "text-[#c48b61]" : "text-[#a89880]"}>
                        {review.likesCount || 0}
                      </span>
                    </button>
                    <span className="text-[#3d352c]">•</span>
                    <span className="text-[#a89880] text-xs">{timeAgo(review.createdAt)}</span>
                  </div>
                  <ReviewComments reviewId={review._id} currentUser={currentUser ?? null} defaultOpen={review._id === highlightReviewId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ProfileMovieModal
        movie={previewMovie}
        isOpen={!!previewMovie}
        onClose={() => setPreviewMovie(null)}
      />
    </div>
  );
}
