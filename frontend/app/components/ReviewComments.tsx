"use client";

import { useState, useEffect } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { commentAPI } from "../config/api";

interface Comment {
  comment: { id: string; text: string; timestamp: string };
  author: string;
}

interface ReviewCommentsProps {
  reviewId: string;
  currentUser: string | null;
  defaultOpen?: boolean;
}

export default function ReviewComments({ reviewId, currentUser, defaultOpen = false }: ReviewCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(defaultOpen);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await commentAPI.getForReview(reviewId);
      setComments(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  const handlePost = async () => {
    if (!currentUser || !newComment.trim()) return;
    setPosting(true);
    try {
      await commentAPI.post({
        profileId: currentUser,
        reviewId,
        text: newComment.trim(),
      });
      setNewComment("");
      fetchComments();
    } catch { /* ignore */ }
    setPosting(false);
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1.5 text-[#a89880] hover:text-white text-xs transition-colors"
      >
        <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
        {comments.length > 0 ? `${comments.length} comments` : "Comment"}
      </button>

      {showComments && (
        <div className="mt-2 space-y-2">
          {comments.map((c) => (
            <div key={c.comment.id} className="bg-[#2a2420] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white text-xs font-medium">{c.author}</span>
              </div>
              <p className="text-[#a89880] text-xs">{c.comment.text}</p>
            </div>
          ))}

          {currentUser && (
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePost()}
                placeholder="Write a comment..."
                className="flex-1 bg-[#2a2420] text-white text-xs rounded-lg px-3 py-2 border border-[#3d352c] focus:outline-none focus:border-[#c49148]"
              />
              <button
                onClick={handlePost}
                disabled={posting || !newComment.trim()}
                className="bg-[#c49148] hover:bg-[#a07838] text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {posting ? "..." : "Post"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
