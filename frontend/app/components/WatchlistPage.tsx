"use client";

import { useState, useEffect } from "react";
import { EyeIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { watchlistAPI } from "../config/api";

interface WatchlistItem {
  _id: string;
  movie: { _id: string; title: string; year: number; poster?: string; avgRating?: number; type?: string };
  status: "watched" | "want_to_watch";
  watchedAt?: string;
  createdAt: string;
}

interface WatchlistPageProps {
  currentUser: string | null;
}

export default function WatchlistPage({ currentUser }: WatchlistPageProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "watched" | "want_to_watch">("all");

  useEffect(() => {
    if (currentUser) fetchWatchlist();
    else setLoading(false);
  }, [currentUser]);

  const fetchWatchlist = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data } = await watchlistAPI.get(currentUser);
      setItems(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleRemove = async (contentId: string) => {
    if (!currentUser) return;
    try {
      await watchlistAPI.remove(currentUser, contentId);
      setItems((prev) => prev.filter((i) => i.movie?._id !== contentId));
    } catch { /* ignore */ }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-[#2a2420] rounded-2xl p-8 text-center">
          <BookmarkIcon className="w-12 h-12 text-[#a89880] mx-auto mb-4" />
          <p className="text-[#a89880] text-lg">Log in to see your watchlist</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-[#a89880] text-lg">Loading watchlist...</div>
      </div>
    );
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const watchedCount = items.filter((i) => i.status === "watched").length;
  const wantCount = items.filter((i) => i.status === "want_to_watch").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-[#2a2420] rounded-xl px-5 py-3 flex items-center gap-3">
          <EyeIcon className="w-5 h-5 text-[#34A853]" />
          <div>
            <p className="text-white font-bold text-lg">{watchedCount}</p>
            <p className="text-[#a89880] text-xs">Watched</p>
          </div>
        </div>
        <div className="bg-[#2a2420] rounded-xl px-5 py-3 flex items-center gap-3">
          <BookmarkIcon className="w-5 h-5 text-[#c49148]" />
          <div>
            <p className="text-white font-bold text-lg">{wantCount}</p>
            <p className="text-[#a89880] text-xs">Want to Watch</p>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="flex gap-1 mb-6 bg-[#2a2420] rounded-xl p-1 w-fit">
        {([
          { key: "all", label: `All (${items.length})` },
          { key: "watched", label: `Watched (${watchedCount})` },
          { key: "want_to_watch", label: `Want to Watch (${wantCount})` },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? "bg-[#c49148] text-white" : "text-[#a89880] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="group relative">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2420] border border-[#3d352c]">
                {item.movie?.poster ? (
                  <img
                    src={item.movie.poster}
                    alt={item.movie.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl">🎬</span>
                  </div>
                )}
                {/* status badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === "watched"
                        ? "bg-[#34A853]/90 text-white"
                        : "bg-[#c49148]/90 text-white"
                    }`}
                  >
                    {item.status === "watched" ? "Watched" : "Want to Watch"}
                  </span>
                </div>
                {/* remove button */}
                <button
                  onClick={() => handleRemove(item.movie?._id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2">
                <p className="text-white text-xs font-medium truncate">{item.movie?.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-[#a89880] text-[10px]">{item.movie?.year}</p>
                  {item.movie?.avgRating ? (
                    <>
                      <span className="text-[#a89880] text-[10px]">·</span>
                      <StarIcon className="w-3 h-3 text-[#c49148]" />
                      <span className="text-[#a89880] text-[10px]">{item.movie.avgRating.toFixed(1)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#16130e] rounded-xl p-8 text-center">
          <p className="text-[#a89880]">
            {filter === "all"
              ? "Your watchlist is empty. Browse films and add some!"
              : `No ${filter === "watched" ? "watched films" : "films to watch"} yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
