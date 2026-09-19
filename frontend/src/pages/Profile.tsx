import { useState } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { formatDate, cn } from '../utils/helpers';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app, you'd call an API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      // In a real app, you'd call an API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"/></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Profile Settings</h1>
        <p className="text-dark-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-dark-900">{user.full_name}</h2>
            <p className="text-dark-500">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn('badge', 'badge-info')}>{user.role}</span>
              <span className="text-sm text-dark-500">Member since {formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-dark-200">
          <nav className="flex" aria-label="Profile tabs">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                className={cn(
                  'py-4 px-6 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700'
                )}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="label">Full Name</label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-5 h-5 text-dark-400"/></div>
                    <input id="full_name" type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="input pl-10" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-dark-400"/></div>
                    <input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input pl-10" required />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-dark-400"/></div>
                  <input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input pl-10" />
                </div>
              </div>
              <div className="pt-4 border-t border-dark-200 flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <> <Save className="w-4 h-4 mr-2"/>Save Changes</> }
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="current_password" className="label">Current Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-dark-400"/></div>
                  <input id="current_password" type={showPassword ? 'text' : 'password'} value={formData.current_password} onChange={e => setFormData({ ...formData, current_password: e.target.value })} className="input pl-10 pr-12" required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="new_password" className="label">New Password</label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-dark-400"/></div>
                    <input id="new_password" type={showPassword ? 'text' : 'password'} value={formData.new_password} onChange={e => setFormData({ ...formData, new_password: e.target.value })} className="input pl-10 pr-12" minLength={8} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-dark-500">Must be at least 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirm_password" className="label">Confirm New Password</label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-dark-400"/></div>
                    <input id="confirm_password" type={showPassword ? 'text' : 'password'} value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} className="input pl-10 pr-12" minLength={8} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-dark-200 flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <> <Lock className="w-4 h-4 mr-2"/>Change Password</> }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}