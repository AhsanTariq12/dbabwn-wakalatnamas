'use client'

import { useState, useEffect, FormEvent } from 'react'
import { getUsersAction, createUserAction, deleteUserAction } from '@/app/actions/users'
import { Loader2, UserPlus, Shield, User, Mail, Calendar, Trash2, Users } from 'lucide-react'

export default function UsersView() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const result = await getUsersAction()
    if (result.success) {
      // Sort so admins/superadmins appear first
      const sorted = (result.users || []).sort((a, b) => {
        if (a.role === 'super_admin') return -1;
        if (b.role === 'super_admin') return 1;
        if (a.role === 'admin') return -1;
        if (b.role === 'admin') return 1;
        return 0;
      });
      setUsers(sorted)
    } else {
      console.error(result.error)
    }
    setLoading(false)
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('name', name)
    formData.append('role', role)

    const result = await createUserAction(formData)

    if (result.success) {
      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setRole('viewer')
      // Refresh list
      await fetchUsers()
    } else {
      setErrorMsg(result.error || 'Failed to create user.')
    }
    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you certain you want to completely delete this user account?')) return

    // Optimistic loading visual
    setLoading(true)
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteUserAction(formData)

    if (result.success) {
      await fetchUsers()
    } else {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">View and manage system accounts efficiently.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form Section */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 mb-6">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <UserPlus size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Create New User</h2>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="e.g. Ali Raza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="admin@bwnbar.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="Enter a secure password..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Account Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm appearance-none"
                >
                  <option value="viewer">Viewer (Read-Only)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Provision Account'}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Users List Section */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 h-full opacity-100">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Active Accounts Directory</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading directory...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No active accounts found in public.users table.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        {user.role === 'super_admin' ? <Shield size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                          {user.name || 'No Name Set'}
                          {user.role === 'super_admin' && <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/10 text-red-400 px-2 py-0.5 rounded">Superadmin</span>}
                          {user.role === 'admin' && <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Admin</span>}
                          {user.role === 'viewer' && <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Viewer</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Revoke / Delete Account"
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
