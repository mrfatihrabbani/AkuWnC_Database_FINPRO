"use client";

import { useState, useEffect } from "react";
import { PlayIcon, HeartIcon, EyeIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { breakdownAPI, contentAPI } from "../config/api";

function toEmbedUrl(url: string): string {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

interface Video {
  _id: string;
  creator: { username: string; avatar?: string };
  title: string;
  description: string;
  videoUrl: string;
  contentType: "Breakdown" | "Video Essay";
  subCategory: string;
  relatedContentId: { _id: string; title: string; poster?: string; year?: number };
  containsSpoilers: boolean;
  viewsCount: number;
  likes: string[];
  createdAt: string;
}

interface BreakdownsPageProps {
  currentUser: string | null;
}

const SUB_CATEGORIES = ["Trailer/TV Spot", "Fight Analysis", "Character Development", "Criticism", "Commentary"];

export default function BreakdownsPage({ currentUser }: BreakdownsPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<"Breakdown" | "Video Essay">("Breakdown");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    setVideos([]);
    setPage(1);
    fetchVideos(1);
  }, [activeTab]);

  const fetchVideos = async (p: number) => {
    setLoading(true);
    try {
      const { data } = await breakdownAPI.getByType(activeTab, p);
      if (p === 1) setVideos(data);
      else setVideos((prev) => [...prev, ...data]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleLike = async (videoId: string) => {
    if (!currentUser) return;
    try {
      await breakdownAPI.toggleLike(videoId);
      setVideos((prev) =>
        prev.map((v) => {
          if (v._id !== videoId) return v;
          const hasLiked = v.likes.includes(currentUser);
          return {
            ...v,
            likes: hasLiked
              ? v.likes.filter((u) => u !== currentUser)
              : [...v.likes, currentUser],
          };
        })
      );
    } catch { /* ignore */ }
  };

  const handlePlay = async (video: Video) => {
    setPlayingVideo(video);
    try { await breakdownAPI.trackView(video._id); } catch { /* ignore */ }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchVideos(next);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Breakdowns & Video Essays</h1>
          <p className="text-[#a89880] text-sm">Watch community analyses and creator content</p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#c49148] hover:bg-[#a07838] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>

      {/* tabs */}
      <div className="flex gap-1 mb-6 bg-[#2a2420] rounded-xl p-1 w-fit">
        {(["Breakdown", "Video Essay"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-[#c49148] text-white" : "text-[#a89880] hover:text-white"
            }`}
          >
            {tab === "Breakdown" ? "Breakdowns" : "Video Essays"}
          </button>
        ))}
      </div>

      {/* grid */}
      {loading && videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#a89880]">Loading...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-[#16130e] rounded-xl p-12 text-center">
          <PlayIcon className="w-12 h-12 text-[#a89880] mx-auto mb-3" />
          <p className="text-[#a89880] text-lg mb-1">No {activeTab.toLowerCase()}s yet</p>
          <p className="text-[#a89880] text-sm">Be the first to upload one!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-[#16130e] rounded-xl overflow-hidden border border-[#3d352c] hover:border-[#c49148]/50 transition-colors group"
              >
                {/* thumbnail */}
                <div
                  onClick={() => handlePlay(video)}
                  className="relative aspect-video bg-[#2a2420] cursor-pointer overflow-hidden"
                >
                  {video.relatedContentId?.poster ? (
                    <img
                      src={video.relatedContentId.poster}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#c49148]/80 transition-colors">
                      <PlayIcon className="w-7 h-7 text-white ml-0.5" />
                    </div>
                  </div>
                  {video.containsSpoilers && (
                    <span className="absolute top-2 left-2 text-[10px] bg-red-500/90 text-white px-2 py-0.5 rounded-full font-medium">
                      Spoilers
                    </span>
                  )}
                  <span className="absolute top-2 right-2 text-[10px] bg-[#2a2420]/90 text-[#a89880] px-2 py-0.5 rounded-full">
                    {video.subCategory}
                  </span>
                </div>

                {/* info */}
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-[#a89880] text-xs mb-3 line-clamp-2">{video.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] flex items-center justify-center">
                        {video.creator?.avatar ? (
                          <img src={video.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-[10px] font-bold">
                            {video.creator?.username?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span className="text-[#a89880] text-xs">{video.creator?.username}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[#a89880] text-xs">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {video.viewsCount}
                      </span>
                      <button
                        onClick={() => handleLike(video._id)}
                        className="flex items-center gap-1 text-xs transition-colors"
                      >
                        {currentUser && video.likes.includes(currentUser) ? (
                          <HeartIcon className="w-3.5 h-3.5 text-[#c48b61]" />
                        ) : (
                          <HeartOutline className="w-3.5 h-3.5 text-[#a89880] hover:text-[#c48b61]" />
                        )}
                        <span className={currentUser && video.likes.includes(currentUser) ? "text-[#c48b61]" : "text-[#a89880]"}>
                          {video.likes.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {video.relatedContentId && (
                    <div className="mt-3 pt-3 border-t border-[#3d352c]">
                      <span className="text-[#a89880] text-[10px] uppercase tracking-wider">About</span>
                      <p className="text-[#d4a050] text-xs font-medium truncate">
                        {video.relatedContentId.title} {video.relatedContentId.year && `(${video.relatedContentId.year})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-[#2a2420] hover:bg-[#3d352c] text-[#a89880] hover:text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        </>
      )}

      {/* video player modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPlayingVideo(null)} />
          <div className="relative bg-[#1c1914] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#3d352c]">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/40 rounded-full p-1.5"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
              <iframe
                src={toEmbedUrl(playingVideo.videoUrl)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">{playingVideo.title}</h2>
              <p className="text-[#a89880] text-sm mb-4">{playingVideo.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[#a89880]">by {playingVideo.creator?.username}</span>
                <span className="flex items-center gap-1 text-[#a89880]">
                  <EyeIcon className="w-4 h-4" /> {playingVideo.viewsCount + 1} views
                </span>
                <span className="flex items-center gap-1 text-[#a89880]">
                  <HeartIcon className="w-4 h-4" /> {playingVideo.likes.length} likes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* upload modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchVideos(1); }} />}
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [contentType, setContentType] = useState<"Breakdown" | "Video Essay">("Breakdown");
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[0]);
  const [contentId, setContentId] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ _id: string; title: string; year: number }[]>([]);
  const [selectedContent, setSelectedContent] = useState<{ _id: string; title: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const { data } = await contentAPI.search(q);
      setSearchResults(data.slice(0, 5));
    } catch { /* ignore */ }
  };

  const handleSubmit = async () => {
    if (!title || !videoUrl || !contentId) {
      setError("Title, video URL, and related content are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await breakdownAPI.upload({
        title,
        description,
        videoUrl,
        contentType,
        subCategory,
        relatedContentId: contentId,
        containsSpoilers,
      });
      onSuccess();
    } catch {
      setError("Failed to upload. Make sure you're logged in.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#2a2420] rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-[#3d352c] max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#a89880] hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Upload Video</h2>

        <div className="space-y-4">
          {/* title */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148]"
              placeholder="Video title"
            />
          </div>

          {/* video url */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Video URL</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148]"
              placeholder="https://youtube.com/embed/... or video URL"
            />
          </div>

          {/* description */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] resize-none"
              placeholder="Describe your video"
            />
          </div>

          {/* type */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Type</label>
            <div className="flex gap-2">
              {(["Breakdown", "Video Essay"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    contentType === t ? "bg-[#c49148] text-white" : "bg-[#16130e] text-[#a89880] border border-[#3d352c]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* subcategory */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {SUB_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSubCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    subCategory === cat ? "bg-[#c49148] text-white" : "bg-[#16130e] text-[#a89880] border border-[#3d352c]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* related content search */}
          <div>
            <label className="text-[#a89880] text-sm block mb-1">Related Movie/Series</label>
            {selectedContent ? (
              <div className="flex items-center gap-2 bg-[#16130e] rounded-lg px-4 py-3 border border-[#c49148]">
                <span className="text-white text-sm flex-1">{selectedContent.title}</span>
                <button onClick={() => { setSelectedContent(null); setContentId(""); }} className="text-[#a89880] hover:text-white">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148]"
                  placeholder="Search for a movie or series..."
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16130e] border border-[#3d352c] rounded-lg overflow-hidden z-10">
                    {searchResults.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => { setSelectedContent(r); setContentId(r._id); setSearchResults([]); setSearchQuery(""); }}
                        className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-[#2a2420] transition-colors"
                      >
                        {r.title} ({r.year})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* spoilers */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="w-4 h-4 rounded border-[#3d352c] bg-[#16130e] text-[#c49148] focus:ring-[#c49148]"
            />
            <span className="text-[#a89880] text-sm">Contains spoilers</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-[#16130e] text-[#a89880] py-3 rounded-lg hover:bg-[#3d352c] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-[#c49148] hover:bg-[#a07838] text-white py-3 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {saving ? "Uploading..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
