"use client";

import {
  HomeIcon,
  FilmIcon,
  UserGroupIcon,
  StarIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  FilmIcon as FilmIconSolid,
} from "@heroicons/react/24/solid";

const menuItems = [
  { icon: HomeIcon, activeIcon: HomeIconSolid, label: "Home", id: "home" },
  { icon: FilmIcon, activeIcon: FilmIconSolid, label: "Films", id: "films" },
  { icon: StarIcon, label: "Reviews", id: "reviews" },
  { icon: BookmarkIcon, label: "Watchlist", id: "watchlist" },
  { icon: ChartBarIcon, label: "Stats", id: "stats" },
];

interface SidebarProps {
  activeItem: string;
  onItemChange: (id: string) => void;
}

export default function Sidebar({ activeItem, onItemChange }: SidebarProps) {

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-[#16130e] flex flex-col items-center py-6 z-50">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c49148] to-[#d4a050] flex items-center justify-center overflow-hidden p-1">
          <img src="/icon.png" alt="Logo" className="w-full h-full object-contain invert" />
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const Icon = activeItem === item.id && item.activeIcon ? item.activeIcon : item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                ${activeItem === item.id
                  ? "bg-[#c49148] text-white"
                  : "text-[#a89880] hover:bg-[#2a2420] hover:text-white"
                }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}