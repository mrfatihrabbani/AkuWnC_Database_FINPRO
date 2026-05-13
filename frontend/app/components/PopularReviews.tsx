"use client";

import { useState, useEffect } from "react";
import { StarIcon, HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { reviewAPI, contentAPI } from '../config/api';
import ProfileMovieModal from './ProfileMovieModal';

interface Review {
  _id: string;
  user: { username: string; avatar?: string };
  contentId: { _id: string; title: string; poster?: string };
  rating: number;
  content: string;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
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

export default function PopularReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [previewMovie, setPreviewMovie] = useState<MoviePreview | null>(null);

  const handleMovieClick = async (contentId: string) => {
    try {
      const { data } = await contentAPI.getById(contentId);
      setPreviewMovie(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setCurrentUser(localStorage.getItem("currentUser"));
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await reviewAPI.getPopular(4);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!currentUser) return;
    try {
      await reviewAPI.toggleLike(reviewId, currentUser);
      fetchReviews();
    } catch { /* ignore */ }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="w-4 h-4 text-[#c49148]" />);
    }
    if (rating % 1 >= 0.5) {
      stars.push(<StarIcon key="half" className="w-4 h-4 text-[#c49148] opacity-50" />);
    }
    return stars;
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Popular Reviews This Week</h2>
        <p className="text-sm text-[#a89880]">See what the community is talking about</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-[#16130e] rounded-xl p-4 hover:bg-[#2a2420] transition-colors"
          >
            <div className="flex gap-4">
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
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {review.user?.username?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white font-medium text-sm">{review.user?.username || "Unknown"}</span>
                    <span className="text-[#a89880] text-sm"> reviewed </span>
                    <span className="text-[#d4a050] font-medium text-sm">{review.contentId?.title || "Unknown"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                {review.content && <p className="text-[#a89880] text-sm line-clamp-2">{review.content}</p>}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleLike(review._id)}
                    className="flex items-center gap-1 text-[#a89880] hover:text-[#c49148] transition-colors text-sm"
                  >
                    {currentUser && review.likedBy?.includes(currentUser) ? (
                      <HeartIcon className="w-4 h-4 text-[#c48b61]" />
                    ) : (
                      <HeartOutline className="w-4 h-4" />
                    )}
                    <span>{review.likesCount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-[#16130e] rounded-xl p-8 text-center">
            <p className="text-[#a89880]">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
      <ProfileMovieModal
        movie={previewMovie}
        isOpen={!!previewMovie}
        onClose={() => setPreviewMovie(null)}
      />
    </section>
  );
}