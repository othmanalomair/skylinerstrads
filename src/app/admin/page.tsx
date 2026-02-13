"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";

interface Stats {
  totalUsers: number;
  totalPokemon: number;
  totalConversations: number;
  totalMessages: number;
}

interface UserRow {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  team: string | null;
  role: string;
  createdAt: string;
  pokemonCount: number;
  conversationCount: number;
  messageCount: number;
}

interface UserDetail extends UserRow {
  bio: string | null;
  trainerCode: string | null;
  trainerCode2: string | null;
  pokemonLists: {
    id: string;
    pokemonId: number;
    pokemonName: string;
    listType: string;
    isShiny: boolean;
    isMirror: boolean;
    isDynamax: boolean;
    notes: string | null;
  }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [viewUser, setViewUser] = useState<UserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const fetchUsers = useCallback(() => {
    setUsersLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setUsersLoading(false));
  }, [page, search]);

  useEffect(() => {
    if (session && (session.user as any).role === "ADMIN") {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleView(user: UserRow) {
    setViewOpen(true);
    setViewLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`);
    const data = await res.json();
    setViewUser(data);
    setViewLoading(false);
  }

  function handleDeleteClick(user: UserRow) {
    setDeleteUser(user);
    setDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteUser) return;
    setDeleting(true);
    await fetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteUser(null);
    fetchUsers();
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Users" value={stats.totalUsers} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <StatCard label="Pokemon Listed" value={stats.totalPokemon} icon="M12 2a10 10 0 100 20 10 10 0 000-20zm0 7a3 3 0 110 6 3 3 0 010-6z" />
          <StatCard label="Conversations" value={stats.totalConversations} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          <StatCard label="Messages" value={stats.totalMessages} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </div>
      )}

      {/* Users Section */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Users {total > 0 && <span className="text-gray-400 font-normal text-sm">({total})</span>}
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="!w-56"
            />
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>

        {usersLoading ? (
          <div className="p-12">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium text-right">Pokemon</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            username={user.username}
                            displayName={user.displayName}
                            team={user.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium">{user.displayName || user.username}</div>
                            <div className="text-gray-400 text-xs">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        {user.team ? <Badge variant="team">{user.team}</Badge> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {user.role === "ADMIN" ? (
                          <Badge className="bg-red-100 text-red-800">ADMIN</Badge>
                        ) : (
                          <Badge>USER</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">{user.pokemonCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(user)}>
                            View
                          </Button>
                          {user.id !== session?.user.id && (
                            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      username={user.username}
                      displayName={user.displayName}
                      team={user.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.displayName || user.username}</div>
                      <div className="text-gray-400 text-xs">@{user.username}</div>
                    </div>
                    {user.role === "ADMIN" && <Badge className="bg-red-100 text-red-800">ADMIN</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {user.email} &middot; {user.pokemonCount} pokemon &middot; Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(user)}>View</Button>
                    {user.id !== session?.user.id && (
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>Delete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                  Page {page} of {pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View User Modal */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setViewUser(null); }} title="User Details">
        {viewLoading ? (
          <div className="py-8"><Spinner /></div>
        ) : viewUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                username={viewUser.username}
                displayName={viewUser.displayName}
                team={viewUser.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
                size="lg"
              />
              <div>
                <div className="font-semibold text-lg">{viewUser.displayName || viewUser.username}</div>
                <div className="text-gray-500">@{viewUser.username}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Email</span>
                <div className="font-medium">{viewUser.email}</div>
              </div>
              <div>
                <span className="text-gray-500">Team</span>
                <div>{viewUser.team ? <Badge variant="team">{viewUser.team}</Badge> : "None"}</div>
              </div>
              <div>
                <span className="text-gray-500">Role</span>
                <div>{viewUser.role === "ADMIN" ? <Badge className="bg-red-100 text-red-800">ADMIN</Badge> : <Badge>USER</Badge>}</div>
              </div>
              <div>
                <span className="text-gray-500">Joined</span>
                <div className="font-medium">{new Date(viewUser.createdAt).toLocaleDateString()}</div>
              </div>
              {viewUser.trainerCode && (
                <div>
                  <span className="text-gray-500">Trainer Code</span>
                  <div className="font-mono font-medium">{viewUser.trainerCode}</div>
                </div>
              )}
              {viewUser.trainerCode2 && (
                <div>
                  <span className="text-gray-500">Second Trainer Code</span>
                  <div className="font-mono font-medium">{viewUser.trainerCode2}</div>
                </div>
              )}
              <div>
                <span className="text-gray-500">Conversations</span>
                <div className="font-medium">{viewUser.conversationCount}</div>
              </div>
              <div>
                <span className="text-gray-500">Messages</span>
                <div className="font-medium">{viewUser.messageCount}</div>
              </div>
            </div>

            {viewUser.bio && (
              <div>
                <span className="text-sm text-gray-500">Bio</span>
                <p className="text-sm mt-1">{viewUser.bio}</p>
              </div>
            )}

            {viewUser.pokemonLists.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  Pokemon Lists ({viewUser.pokemonLists.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {viewUser.pokemonLists.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{p.pokemonName}</span>
                        <div className="flex gap-1">
                          {p.isShiny && <Badge variant="shiny">Shiny</Badge>}
                          {p.isMirror && <Badge variant="mirror">Mirror</Badge>}
                          {p.isDynamax && <Badge variant="dynamax">Dynamax</Badge>}
                        </div>
                      </div>
                      <Badge variant={p.listType === "WANT" ? "default" : "team"}>
                        {p.listType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteUser(null); }} title="Delete User">
        {deleteUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>@{deleteUser.username}</strong>? This will permanently remove:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>{deleteUser.pokemonCount} pokemon listings</li>
              <li>{deleteUser.conversationCount} conversations</li>
              <li>{deleteUser.messageCount} messages</li>
            </ul>
            <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setDeleteOpen(false); setDeleteUser(null); }}>
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={handleDeleteConfirm}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
