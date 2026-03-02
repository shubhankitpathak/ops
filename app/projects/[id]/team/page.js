"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  async function loadMembers() {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/members`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load members");

      setMembers(data.members);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    
    if (!inviteUsername.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      setInviting(true);
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: inviteUsername.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to invite member");

      alert(data.message);
      setInviteUsername("");
      setInviteRole("viewer");
      loadMembers();
    } catch (err) {
      alert(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update role");

      alert(data.message);
      loadMembers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRemove(userId, username) {
    if (!confirm(`Remove ${username} from this project?`)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to remove member");

      alert(data.message);
      loadMembers();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="py-12">
            <div className="text-2xl font-semibold mb-4">Loading team members...</div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">Error: {error}</p>
          <Button
            onClick={() => router.back()}
            className="mt-4"
            variant="ghost"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const owner = members.find((m) => m.isOwner);
  const isOwner = owner; // TODO: Check if current user is owner
  const collaborators = members.filter((m) => !m.isOwner);
  const pendingInvites = collaborators.filter((m) => m.status === "pending");
  const activeMembers = collaborators.filter((m) => m.status === "accepted");

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="mb-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Project
          </button>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-400 mt-2">
            Manage collaborators and their permissions
          </p>
        </div>

        {/* Invite Form (only for owners/maintainers) */}
        {isOwner && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Invite Collaborator</h2>
            <form onSubmit={handleInvite} className="flex gap-4">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="GitHub username"
                className="flex-1 px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={inviting}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={inviting}
              >
                <option value="viewer">Viewer</option>
                <option value="maintainer">Maintainer</option>
              </select>
              <Button
                type="submit"
                disabled={inviting}
                className="px-6 py-2"
              >
                {inviting ? "Inviting..." : "Invite"}
              </Button>
            </form>
            <p className="text-sm text-gray-400 mt-2">
              <strong>Viewer:</strong> Can view project details | <strong>Maintainer:</strong> Can deploy and manage
            </p>
          </div>
        )}

        {/* Owner Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Owner</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={owner?.avatarUrl || "/default-avatar.png"}
                  alt={owner?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{owner?.username}</p>
                  <p className="text-sm text-gray-400">{owner?.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded text-sm font-medium">
                Owner
              </span>
            </div>
          </div>
        </div>

        {/* Active Members Section */}
        {activeMembers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Active Members ({activeMembers.length})
            </h2>
            <div className="space-y-3">
              {activeMembers.map((member) => (
                <div
                  key={member.userId}
                  className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatarUrl || "/default-avatar.png"}
                      alt={member.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{member.username}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.userId, e.target.value)
                        }
                        className="px-3 py-1 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="maintainer">Maintainer</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          member.role === "maintainer"
                            ? "bg-green-600 text-green-100"
                            : "bg-blue-600 text-blue-100"
                        }`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                    )}
                    {isOwner && (
                      <Button
                        onClick={() =>
                          handleRemove(member.userId, member.username)
                        }
                        variant="ghost"
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Pending Invites ({pendingInvites.length})
            </h2>
            <div className="space-y-3">
              {pendingInvites.map((member) => (
                <div
                  key={member.userId}
                  className="bg-gray-800 p-4 rounded-lg flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatarUrl || "/default-avatar.png"}
                      alt={member.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{member.username}</p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-sm">
                      Pending
                    </span>
                    {isOwner && (
                      <button
                        onClick={() =>
                          handleRemove(member.userId, member.username)
                        }
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeMembers.length === 0 && pendingInvites.length === 0 && (
          <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">
            <p>No collaborators yet. Invite team members to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
