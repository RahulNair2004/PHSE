/**
 * Users Page
 * Fixed: createUser was commented out — now wired to useUsers hook.
 * Fixed: deleteUser wired with confirmation prompt.
 * Fixed: UserResponse fields: { id, name, email, created_at } — no "role" field.
 * Fixed: form uses onClick handlers (no <form> / onSubmit to avoid default behaviour issues).
 */

import React, { useEffect, useState } from 'react';
import { useUsers } from '../hooks';
import { formatDate } from '../utils/helpers';

const initialForm = { name: '', email: '' };

export const Users = () => {
  const { users, loading, error, getAllUsers, createUser, deleteUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleOpenModal = () => {
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      await createUser(formData);
      setIsModalOpen(false);
      getAllUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    await deleteUser(userId);
    getAllUsers();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
            PHSE // User Management
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
          Loading users…
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm font-mono rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {!loading && (!users || users.length === 0) ? (
          <div className="text-center py-16 text-gray-600 font-mono text-sm">
            No users found. Add one to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                {['ID', 'Name', 'Email', 'Created', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-xs font-mono uppercase tracking-widest text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users || []).map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  {/* UserResponse: { id, name, email, created_at } */}
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">#{user.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono">Create New User</h2>
              <p className="text-gray-500 text-xs mt-1">
                New users are identified by their database ID — save it after creation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alice Smith"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm font-mono rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alice@example.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm font-mono rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
                />
              </div>

              {formError && (
                <p className="text-red-400 text-xs font-mono">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-mono rounded-lg border border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;