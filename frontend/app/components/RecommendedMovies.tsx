"use client";

import { useState, useEffect } from "react";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { graphAPI, movieAPI, contentAPI } from '../config/api';

interface RecommendedMovie {
  title: string;
  recommendedBy: number;
  avgScore: number;
  movieDetails?: {
    _id: string;
    year: number;
    director: string;
    genres: string[];
    synopsis: string;
    poster?: string;
  };
}

interface FriendActivity {
  ratedBy: string;
  movie: string;
  score: number;
}

interface RecommendedMoviesProps {
  currentUser: string;
}

export default function RecommendedMovies({ currentUser }: RecommendedMoviesProps) {
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([]);

  useEffect(() => {
    fetchRecommendations();
    fetchFriendActivity();
  }, [currentUser]);

  const fetchRecommendations = async () => {
    try {
      // try content api first
      const { data } = await contentAPI.getRecommendations(currentUser);

      if (data.length > 0) {
        const titles = data.map((r: RecommendedMovie) => r.title);
        const { data: details } = await movieAPI.getByTitles(titles);

        const enriched = data.map((rec: RecommendedMovie) => ({
          ...rec,
          movieDetails: details.find((d: any) => d.title === rec.title),
        }));
        setRecommendations(enriched);
      }
    } catch {
      // fallback to graph api
      try {
        const { data } = await graphAPI.getRecommendations(currentUser);
        if (data.length > 0) {
          const titles = data.map((r: RecommendedMovie) => r.title);
          const { data: details } = await movieAPI.getByTitles(titles);
          const enriched = data.map((rec: RecommendedMovie) => ({
            ...rec,
            movieDetails: details.find((d: any) => d.title === rec.title),
          }));
          setRecommendations(enriched);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    }
  };

  const fetchFriendActivity = async () => {
    try {
      const { data } = await graphAPI.getFriendActivity(currentUser);
      setFriendActivity(data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching friend activity:", error);
    }
  };

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Recommended For You</h2>
        <p className="text-sm text-[#a89880]">Based on what people with similar taste also enjoyed</p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.slice(0, 6).map((rec) => (
            <div key={rec.title} className="group cursor-pointer">
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-[#2a2420] transition-transform group-hover:scale-105">
                {rec.movieDetails?.poster ? (
                  <img src={rec.movieDetails.poster} alt={rec.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                    <BookmarkIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-3">
                  <div className="flex items-center gap-1 text-xs">
                    <StarSolid className="w-3 h-3 text-[#c49148]" />
                    <span className="text-white">{rec.avgScore?.toFixed(1) || "N/A"}</span>
                    <span className="text-[#a89880] ml-1">• {rec.recommendedBy} fans</span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <h4 className="text-white text-sm font-medium truncate group-hover:text-[#d4a050]">{rec.title}</h4>
                <p className="text-[#a89880] text-xs">{rec.movieDetails?.year || ""}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#16130e] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">What Your Friends Watched</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 bg-[#2a2420] rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center">
                  <span className="text-white font-bold">{activity.ratedBy[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.ratedBy}</span> rated
                  </p>
                  <p className="text-[#d4a050] text-sm truncate">{activity.movie}</p>
                </div>
                <div className="flex items-center gap-1">
                  <StarSolid className="w-4 h-4 text-[#c49148]" />
                  <span className="text-white">{activity.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}