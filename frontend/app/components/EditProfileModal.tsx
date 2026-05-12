"use client";

import { useState, useRef, useCallback } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { userAPI } from '../config/api';

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music",
  "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western",
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  username: string;
  currentBio: string;
  currentGender: string;
  currentGenres: string[];
  currentAvatar: string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  username,
  currentBio,
  currentGender,
  currentGenres,
  currentAvatar,
}: EditProfileModalProps) {
  const [bio, setBio] = useState(currentBio);
  const [gender, setGender] = useState(currentGender);
  const [genderMode, setGenderMode] = useState<"preset" | "custom">(
    currentGender && !["Male", "Female"].includes(currentGender) ? "custom" : "preset"
  );
  const [customGender, setCustomGender] = useState(
    currentGender && !["Male", "Female"].includes(currentGender) ? currentGender : ""
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentGenres);
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await userAPI.uploadAvatar(username, formData);
      }
      
      const finalGender = genderMode === "custom" ? customGender : gender;
      await userAPI.updateProfile(username, {
        bio,
        gender: finalGender,
        favoriteGenres: selectedGenres,
      });

      onSave();
      onClose();
    } catch {
      setError("Could not connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#2a2420] rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-[#3d352c] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a89880] hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="text-[#a89880] text-sm block mb-2">Profile Photo</label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-[#c49148] bg-[#c49148]/10"
                : "border-[#3d352c] hover:border-[#a89880]"
            }`}
          >
            {avatarPreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <p className="text-[#a89880] text-sm">Click or drag to change photo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <PhotoIcon className="w-12 h-12 text-[#a89880]" />
                <div>
                  <p className="text-white text-sm font-medium">Click to upload or drag here</p>
                  <p className="text-[#a89880] text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="text-[#a89880] text-sm block mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="text-[#a89880] text-sm block mb-2">Gender</label>
          <div className="flex gap-2 mb-3">
            {["Male", "Female"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGender(g);
                  setGenderMode("preset");
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  genderMode === "preset" && gender === g
                    ? "bg-[#c49148] text-white"
                    : "bg-[#16130e] text-[#a89880] border border-[#3d352c] hover:border-[#a89880]"
                }`}
              >
                {g}
              </button>
            ))}
            <button
              onClick={() => setGenderMode("custom")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                genderMode === "custom"
                  ? "bg-[#c49148] text-white"
                  : "bg-[#16130e] text-[#a89880] border border-[#3d352c] hover:border-[#a89880]"
              }`}
            >
              Custom
            </button>
          </div>
          {genderMode === "custom" && (
            <input
              type="text"
              value={customGender}
              onChange={(e) => setCustomGender(e.target.value)}
              className="w-full bg-[#16130e] text-white rounded-lg px-4 py-3 border border-[#3d352c] focus:outline-none focus:border-[#c49148] transition-colors"
              placeholder="Enter your gender"
            />
          )}
        </div>

        {/* Favorite Genres */}
        <div className="mb-6">
          <label className="text-[#a89880] text-sm block mb-2">
            Favorite Genres
            {selectedGenres.length > 0 && (
              <span className="text-[#c49148] ml-2">({selectedGenres.length} selected)</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-[#c49148] text-white"
                    : "bg-[#16130e] text-[#a89880] border border-[#3d352c] hover:border-[#a89880]"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[#a04030] text-sm text-center mb-4">{error}</p>}

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#16130e] text-[#a89880] py-3 rounded-lg hover:bg-[#3d352c] transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#c49148] hover:bg-[#a07838] text-white py-3 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
