"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { UserCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import EditProfileModal from "./EditProfileModal";
import { graphAPI, userAPI } from '../config/api';

interface UserProfile {
  username: string;
  email: string;
  bio: string;
  avatar?: string;
  gender?: string;
  favoriteGenres?: string[];
  following: { username: string; avatar?: string }[];
  followers: { username: string; avatar?: string }[];
  reviewCount: number;
  watchedCount: number;
  createdAt: string;
}

interface UserReview {
  _id: string;
  rating: number;
  content: string;
  liked: boolean;
  movie: { title: string; year: number; poster?: string };
  createdAt: string;
}

interface ProfilePageProps {
  username: string;
  currentUser?: string;
  onAvatarChange?: () => void;
  onViewProfile?: (username: string) => void;
}

export default function ProfilePage({ username, currentUser, onAvatarChange, onViewProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [showEdit, setShowEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser === username;

  useEffect(() => {
    fetchProfile();
    fetchReviews();
    if (currentUser && currentUser !== username) checkFollowStatus();
  }, [username]);

  const checkFollowStatus = async () => {
    if (!currentUser) return;
    try {
      const { data: followingList } = await graphAPI.getFollowing(currentUser);
      setIsFollowing(followingList.includes(username));
    } catch { /* ignore */ }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await graphAPI.follow(currentUser, username);
      setIsFollowing(true);
      fetchProfile();
    } catch { /* ignore */ }
    setFollowLoading(false);
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await graphAPI.unfollow(currentUser, username);
      setIsFollowing(false);
      fetchProfile();
    } catch { /* ignore */ }
    setFollowLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile(username);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await userAPI.getReviews(username);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#a89880]">Loading profile...</p>
      </div>
    );
  }

  const tabs = ["Profile", "Films", "Reviews", "Watchlist", "Network"];

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center flex-shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserCircleIcon className="w-16 h-16 text-white/70" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 bg-[#3d352c] hover:bg-[#4d453c] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={followLoading}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? "bg-[#3d352c] hover:bg-[#a04030] text-white"
                    : "bg-[#c49148] hover:bg-[#a07838] text-white"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          {profile.gender && (
            <p className="text-[#a89880] text-sm mb-1">{profile.gender}</p>
          )}
          <p className="text-[#a89880] text-sm mb-1">
            Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          {profile.bio && <p className="text-[#a89880] mt-2">{profile.bio}</p>}
          {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.favoriteGenres.map((genre) => (
                <span key={genre} className="bg-[#c49148]/20 text-[#d4a050] text-xs px-2.5 py-1 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{profile.watchedCount}</p>
            <p className="text-[#a89880] text-xs uppercase tracking-wider">Films</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{profile.following.length}</p>
            <p className="text-[#a89880] text-xs uppercase tracking-wider">Following</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{profile.followers.length}</p>
            <p className="text-[#a89880] text-xs uppercase tracking-wider">Followers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#3d352c] mb-8">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "text-[#c49148] border-b-2 border-[#c49148]"
                  : "text-[#a89880] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider">Recent Activity</h2>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="text-[#a89880] text-xs hover:text-[#d4a050] transition-colors uppercase tracking-wider"
                >
                  All
                </button>
              </div>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="group cursor-pointer">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2420] border border-[#3d352c]">
                        {review.movie?.poster ? (
                          <img
                            src={review.movie.poster}
                            alt={review.movie.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">🎬</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-white text-xs font-medium truncate">{review.movie?.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarIcon className="w-3 h-3 text-[#c49148]" />
                          <span className="text-[#a89880] text-xs">{review.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#16130e] rounded-xl p-6 text-center">
                  <p className="text-[#a89880]">No activity yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Activity</h3>
              <div className="bg-[#16130e] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#a89880] text-sm">Films watched</span>
                  <span className="text-white font-medium">{profile.watchedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a89880] text-sm">Reviews written</span>
                  <span className="text-white font-medium">{profile.reviewCount}</span>
                </div>
              </div>
            </div>

            {profile.following.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Following</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.following.map((f) => (
                    <div
                      key={f.username}
                      onClick={() => onViewProfile?.(f.username)}
                      className="flex items-center gap-2 bg-[#2a2420] rounded-full py-1.5 px-3 cursor-pointer hover:bg-[#3d352c] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden">
                        {f.avatar ? (
                          <img src={f.avatar} alt={f.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-bold">{f.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{f.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.followers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-3">Followers</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.followers.map((f) => (
                    <div
                      key={f.username}
                      onClick={() => onViewProfile?.(f.username)}
                      className="flex items-center gap-2 bg-[#2a2420] rounded-full py-1.5 px-3 cursor-pointer hover:bg-[#3d352c] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden">
                        {f.avatar ? (
                          <img src={f.avatar} alt={f.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-bold">{f.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{f.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="flex gap-4 bg-[#16130e] rounded-xl p-4">
                <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#2a2420]">
                  {review.movie?.poster ? (
                    <img src={review.movie.poster} alt={review.movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{review.movie?.title}</h3>
                  <p className="text-[#a89880] text-xs mb-2">{review.movie?.year}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-[#c49148]" />
                    ))}
                  </div>
                  {review.content && <p className="text-[#a89880] text-sm">{review.content}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#16130e] rounded-xl p-8 text-center">
              <p className="text-[#a89880]">No reviews yet</p>
            </div>
          )}
        </div>
      )}

      {/* Network Tab */}
      {activeTab === "network" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-4">
              Following ({profile.following.length})
            </h3>
            <div className="space-y-3">
              {profile.following.map((f) => (
                <div key={f.username} onClick={() => onViewProfile?.(f.username)} className="flex items-center gap-3 bg-[#16130e] rounded-xl p-3 cursor-pointer hover:bg-[#2a2420] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden">
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{f.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-white font-medium">{f.username}</span>
                </div>
              ))}
              {profile.following.length === 0 && (
                <p className="text-[#a89880] text-sm">Not following anyone yet</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#a89880] uppercase tracking-wider mb-4">
              Followers ({profile.followers.length})
            </h3>
            <div className="space-y-3">
              {profile.followers.map((f) => (
                <div key={f.username} onClick={() => onViewProfile?.(f.username)} className="flex items-center gap-3 bg-[#16130e] rounded-xl p-3 cursor-pointer hover:bg-[#2a2420] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center overflow-hidden">
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{f.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-white font-medium">{f.username}</span>
                </div>
              ))}
              {profile.followers.length === 0 && (
                <p className="text-[#a89880] text-sm">No followers yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {(activeTab === "films" || activeTab === "watchlist") && (
        <div className="bg-[#16130e] rounded-xl p-8 text-center">
          <p className="text-[#a89880]">Coming soon</p>
        </div>
      )}

      {profile && (
        <EditProfileModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={() => { fetchProfile(); if (onAvatarChange) onAvatarChange(); }}
          username={username}
          currentBio={profile.bio || ""}
          currentGender={profile.gender || ""}
          currentGenres={profile.favoriteGenres || []}
          currentAvatar={profile.avatar || ""}
        />
      )}
    </div>
  );
}
