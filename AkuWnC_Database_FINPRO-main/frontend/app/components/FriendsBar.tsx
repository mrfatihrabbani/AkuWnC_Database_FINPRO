"use client";

import { useState, useEffect } from "react";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";

interface FriendsBarProps {
  currentUser: string;
}

interface User {
  username: string;
  avatar?: string;
  bio?: string;
}

export default function FriendsBar({ currentUser }: FriendsBarProps) {
  const [following, setFollowing] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchFollowData();
  }, [currentUser]);

  const fetchFollowData = async () => {
    try {
      const followingRes = await fetch(`http://localhost:3001/api/graph/following/${currentUser}`);
      const followingUsernames = await followingRes.json();

      const usersRes = await fetch(`http://localhost:3001/api/users/popular`);
      const users = await usersRes.json();

      setFollowing(users.filter((u: User) => followingUsernames.includes(u.username)));
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  };

  const handleFollow = async (targetUser: string) => {
    try {
      await fetch(`http://localhost:3001/api/graph/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: currentUser, to: targetUser }),
      });
      fetchFollowData();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-white">
          Following ({following.length})
        </h2>
        <ChevronRightIcon className="w-5 h-5 text-[#a89880]" />
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button className="w-16 h-16 rounded-full bg-[#2a2420] flex items-center justify-center hover:bg-[#3d352c] transition-colors">
            <PlusIcon className="w-8 h-8 text-[#a89880]" />
          </button>
          <span className="text-xs text-[#a89880]">Add Friends</span>
        </div>

        {following.map((user) => (
          <div
            key={user.username}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c48b61] to-[#c49148] p-0.5">
              <div className="w-full h-full rounded-full bg-[#16130e] flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#a89880] group-hover:text-white transition-colors truncate max-w-[70px]">
              {user.username}
            </span>
          </div>
        ))}

        {allUsers
          .filter((u) => !following.some((f) => f.username === u.username) && u.username !== currentUser)
          .map((user) => (
            <div
              key={user.username}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
              onClick={() => handleFollow(user.username)}
            >
              <div className="w-16 h-16 rounded-full bg-[#3d352c] flex items-center justify-center relative">
                <span className="text-[#a89880] font-bold text-xl group-hover:text-white">
                  {user.username[0].toUpperCase()}
                </span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#c49148] rounded-full flex items-center justify-center">
                  <PlusIcon className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-xs text-[#a89880] group-hover:text-white transition-colors truncate max-w-[70px]">
                {user.username}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}