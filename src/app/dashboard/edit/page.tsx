"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    trainerCode: "",
    trainerCode2: "",
    team: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          trainerCode: data.trainerCode || "",
          trainerCode2: data.trainerCode2 || "",
          team: data.team || "",
        });
        setAvatarUrl(data.avatarUrl || null);
      })
      .catch((err) => console.error("Profile load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;

        // Crop to square from center
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/webp",
          0.8
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("avatar", compressed, "avatar.webp");

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to upload avatar");
        return;
      }

      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      await updateSession();
    } catch {
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const teams = [
    { value: "", label: "No Team", color: "bg-gray-100 border-gray-300 text-gray-600" },
    { value: "MYSTIC", label: "Mystic", color: "bg-blue-50 border-blue-300 text-blue-700" },
    { value: "VALOR", label: "Valor", color: "bg-red-50 border-red-300 text-red-700" },
    { value: "INSTINCT", label: "Instinct", color: "bg-yellow-50 border-yellow-300 text-yellow-700" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-5">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative group"
          >
            <Avatar
              username={session?.user?.username || ""}
              displayName={form.displayName || null}
              avatarUrl={avatarUrl}
              team={form.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
              size="lg"
            />
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-400">Click to change avatar</p>
        </div>

        <Input
          label="Display Name"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="Your display name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell other trainers about yourself..."
            rows={3}
            maxLength={300}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
        </div>

        <Input
          label="Trainer Code"
          value={form.trainerCode}
          onChange={(e) => setForm({ ...form, trainerCode: e.target.value })}
          placeholder="1234 5678 9012"
          maxLength={14}
          required
        />

        <Input
          label="Second Trainer Code (Optional)"
          value={form.trainerCode2}
          onChange={(e) => setForm({ ...form, trainerCode2: e.target.value })}
          placeholder="1234 5678 9012"
          maxLength={14}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
          <div className="grid grid-cols-2 gap-2">
            {teams.map((team) => (
              <button
                key={team.value}
                type="button"
                onClick={() => setForm({ ...form, team: team.value })}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  form.team === team.value
                    ? `${team.color} border-current ring-2 ring-offset-1`
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {team.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
