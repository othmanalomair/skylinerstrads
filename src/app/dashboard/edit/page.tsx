"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    trainerCode: "",
    team: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          trainerCode: data.trainerCode || "",
          team: data.team || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

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
