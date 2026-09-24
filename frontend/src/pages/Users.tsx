import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword } from '../store/usersSlice';
import toast from 'react-hot-toast';
import { Search, Loader2, Edit, Trash2, ShieldCheck, KeyRound, Plus, Copy } from 'lucide-react';
import { formatDate, cn } from '../utils/helpers';
import type { UserRole } from '../types';

const roleBadge: Record<string, string> = {
  admin: 'badge badge-warning',
  trainer: 'badge badge-info',
  member: 'badge badge-success',
};

export default function Users() {
  const dispatch = useAppDispatch();
  const { items: users, isLoading } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member' | 'trainer'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string } | null>(null);
  const [createData, setCreateData] = useState({ full_name: '', email: '', phone: '', password: 'admin12345' });
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: 'member' as UserRole,
    is_active: true,
    new_password: '',
  });

  useEffect(() => { dispatch(fetchUsers({})); }, [dispatch]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      full_name: u.full_name,
      phone: u.phone || '',
      role: u.role,
      is_active: u.is_active,
      new_password: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { new_password, ...userData } = formData;
      await dispatch(updateUser({
        id: editingUser.id,
        data: { ...userData, phone: userData.phone || null },
      })).unwrap();
      if (new_password) {
        await dispatch(resetUserPassword({ id: editingUser.id, new_password })).unwrap();
        toast.success('Password reset');
      }
      toast.success('User updated');
      setShowModal(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (confirm('Delete this user and their profile? This cannot be undone.')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success('User deleted');
      } catch (e: any) {
        toast.error(e);
      }
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createUser({
        email: createData.email,
        password: createData.password,
        full_name: createData.full_name,
        phone: createData.phone || null,
        role: 'admin',
      })).unwrap();
      setLastCredentials({ email: createData.email, password: createData.password });
      toast.success('Admin created — share the login with them');
      setShowCreateModal(false);
      setCreateData({ full_name: '', email: '', phone: '', password: 'admin12345' });
    } catch (e: any) {
      toast.error(e || 'Failed to create admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-500" /> User Management
          </h1>
          <p className="text-dark-500 mt-1">Admin-only: members/trainers are created from their pages; create extra admins here</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Admin
        </button>
      </div>

      {lastCredentials && (
        <div className="card p-4 border-primary-500/40 bg-primary-500/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-primary-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-dark-900">Share this admin login</p>
              <p className="text-dark-600">Email: <span className="font-medium">{lastCredentials.email}</span> · Password: <span className="font-medium">{lastCredentials.password}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(`Email: ${lastCredentials.email}\nPassword: ${lastCredentials.password}`); toast.success('Copied'); }} className="btn-secondary text-sm"><Copy className="w-4 h-4 mr-1" />Copy</button>
            <button onClick={() => setLastCredentials(null)} className="btn-ghost text-sm">Dismiss</button>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input type="text" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="input w-auto">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="animate-pulse p-4 border-b border-dark-200" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 bg-dark-50">
                  <th className="text-left p-4 font-medium text-dark-500">User</th>
                  <th className="text-left p-4 font-medium text-dark-500">Role</th>
                  <th className="text-left p-4 font-medium text-dark-500">Status</th>
                  <th className="text-left p-4 font-medium text-dark-500 hidden md:table-cell">Joined</th>
                  <th className="text-right p-4 font-medium text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="animate-fade-in hover:bg-dark-50">
                    <td className="p-4">
                      <p className="font-medium text-dark-900">{u.full_name}</p>
                      <p className="text-sm text-dark-500">{u.email}{u.id === currentUser?.id && ' (you)'}</p>
                    </td>
                    <td className="p-4"><span className={cn(roleBadge[u.role] || 'badge badge-info')}>{u.role}</span></td>
                    <td className="p-4">
                      <span className={cn(u.is_active ? 'badge badge-success' : 'badge badge-danger')}>
                        {u.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-dark-500">{formatDate(u.created_at)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(u)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200" aria-label="Edit user">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={u.id === currentUser?.id}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-dark-500">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Admin</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200">✕</button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <p className="text-sm text-dark-500">Creates an admin login. Share the email + password with them. For members/trainers use the Members/Trainers pages.</p>
              <div><label className="label">Full Name</label><input type="text" value={createData.full_name} onChange={e => setCreateData({ ...createData, full_name: e.target.value })} className="input" required minLength={2} /></div>
              <div><label className="label">Email</label><input type="email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} className="input" required /></div>
              <div><label className="label">Phone (optional)</label><input type="text" value={createData.phone} onChange={e => setCreateData({ ...createData, phone: e.target.value })} className="input" /></div>
              <div><label className="label">Password — share with admin</label><input type="text" value={createData.password} onChange={e => setCreateData({ ...createData, password: e.target.value })} className="input" required minLength={8} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Full Name</label><input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="input" required minLength={2} /></div>
              <div><label className="label">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Role</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="input">
                    <option value="member">Member</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-dark-300 text-primary-600" />
                    <span className="text-sm text-dark-600">Active</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> New Password (optional)</label>
                <input type="password" value={formData.new_password} onChange={e => setFormData({ ...formData, new_password: e.target.value })} className="input" placeholder="Leave blank to keep current" minLength={8} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
