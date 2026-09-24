import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchTrainers, createTrainer, updateTrainer, deleteTrainer } from '../store/trainersSlice';
import { fetchMembers } from '../store/membersSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Loader2, Edit, Trash2, Dumbbell, Award, DollarSign, Copy, KeyRound, RefreshCw } from 'lucide-react';
import { formatDate, cn } from '../utils/helpers';

function generatePassword(length = 10) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let out = '';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

export default function Trainers() {
  const dispatch = useAppDispatch();
  const { items: trainers, isLoading } = useAppSelector((state) => state.trainers);
  const { items: members } = useAppSelector((state) => state.members);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    specialization: '',
    experience_years: 0,
    certification: '',
    hourly_rate: '',
    password: 'trainer123',
  });

  useEffect(() => {
    dispatch(fetchTrainers());
    dispatch(fetchMembers({ limit: 1000 }));
  }, [dispatch]);

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = trainer.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      trainer.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      trainer.user.email.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialization?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        user: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'trainer' as const,
        },
        employee_id: formData.employee_id,
        specialization: formData.specialization,
        experience_years: parseInt(formData.experience_years.toString()),
        certification: formData.certification,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      };
      if (editingTrainer) {
        await dispatch(updateTrainer({ id: editingTrainer.id, data })).unwrap();
        toast.success('Trainer updated successfully');
        setShowModal(false);
      } else {
        await dispatch(createTrainer(data)).unwrap();
        setLastCredentials({ email: formData.email, password: formData.password });
        toast.success('Trainer created — share the login with the trainer');
        setShowModal(false);
      }
      resetForm();
    } catch (error: any) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleEdit = (trainer: any) => {
    setEditingTrainer(trainer);
    setFormData({
      full_name: trainer.user.full_name,
      email: trainer.user.email,
      phone: trainer.user.phone || '',
      employee_id: trainer.employee_id,
      specialization: trainer.specialization || '',
      experience_years: trainer.experience_years,
      certification: trainer.certification || '',
      hourly_rate: trainer.hourly_rate?.toString() || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      try {
        await dispatch(deleteTrainer(id)).unwrap();
        toast.success('Trainer deleted');
      } catch (error: any) {
        toast.error(error || 'Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setEditingTrainer(null);
    setShowPassword(false);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      employee_id: '',
      specialization: '',
      experience_years: 0,
      certification: '',
      hourly_rate: '',
      password: 'trainer123',
    });
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const copyCredentials = () => {
    if (!lastCredentials) return;
    navigator.clipboard.writeText(`Email: ${lastCredentials.email}\nPassword: ${lastCredentials.password}\nLogin at /login`);
    toast.success('Credentials copied — share with the trainer');
  };

  const assignedMembersCount = (trainerId: number) => {
    return members.filter(m => m.trainer_id === trainerId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Trainers</h1>
          <p className="text-dark-500 mt-1">Create trainer logins here and share the email + password with them for sign-in</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Trainer
        </button>
      </div>

      {lastCredentials && (
        <div className="card p-4 border-primary-500/40 bg-primary-500/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-primary-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-dark-900">Share this login with the trainer</p>
              <p className="text-dark-600">Email: <span className="font-medium">{lastCredentials.email}</span> · Password: <span className="font-medium">{lastCredentials.password}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyCredentials} className="btn-secondary text-sm"><Copy className="w-4 h-4 mr-1" />Copy</button>
            <button onClick={() => setLastCredentials(null)} className="btn-ghost text-sm">Dismiss</button>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 border-b border-dark-200">
                <div className="w-10 h-10 rounded-full bg-dark-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-200 rounded w-1/4" />
                  <div className="h-3 bg-dark-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50">
                    <th className="text-left p-4 font-medium text-dark-500">Trainer</th>
                    <th className="text-left p-4 font-medium text-dark-500 hidden md:table-cell">Specialization</th>
                    <th className="text-left p-4 font-medium text-dark-500 hidden lg:table-cell">Experience</th>
                    <th className="text-left p-4 font-medium text-dark-500">Status</th>
                    <th className="text-left p-4 font-medium text-dark-500 hidden xl:table-cell">Assigned Members</th>
                    <th className="text-left p-4 font-medium text-dark-500">Hire Date</th>
                    <th className="text-right p-4 font-medium text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer.id} className="trainer-row hover:bg-dark-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-dark-900">{trainer.user.full_name}</p>
                            <p className="text-sm text-dark-500">{trainer.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-dark-600">{trainer.specialization || 'General'}</td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-dark-600">
                          <Award className="w-4 h-4" />
                          {trainer.experience_years} years
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn('badge', trainer.is_active ? 'badge-success' : 'badge-danger')}>
                          {trainer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 hidden xl:table-cell">
                        <span className="text-dark-600">{assignedMembersCount(trainer.id)} members</span>
                      </td>
                      <td className="p-4 text-dark-600">{formatDate(trainer.hire_date)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(trainer)}
                            className="p-2 rounded-lg text-dark-500 hover:bg-dark-200 hover:text-dark-700 transition-colors"
                            aria-label="Edit trainer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trainer.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            aria-label="Delete trainer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTrainers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-dark-500">
                        No trainers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredTrainers.length > 0 && (
              <div className="p-4 border-t border-dark-200 flex items-center justify-between">
                <p className="text-sm text-dark-500">
                  Showing {filteredTrainers.length} of {trainers.length} trainers
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h3 className="text-lg font-medium text-dark-900 border-b border-dark-200 pb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
                </div>
                {!editingTrainer && (
                  <div>
                    <label className="label">Login Password — share with trainer</label>
                    <div className="flex gap-2">
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input flex-1" required minLength={8} />
                      <button type="button" onClick={() => setFormData({...formData, password: generatePassword()})} className="btn-secondary px-3" title="Generate password"><RefreshCw className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn-secondary px-3">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium text-dark-900 border-b border-dark-200 pb-2 mt-2">Professional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee ID</label>
                  <input type="text" value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="label">Specialization</label>
                  <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="input" placeholder="e.g., Strength Training, Yoga, HIIT" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Experience (Years)</label>
                  <input type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})} className="input" min={0} />
                </div>
                <div>
                  <label className="label">Hourly Rate</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="number" step="0.01" value={formData.hourly_rate} onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})} className="input pl-10" min={0} placeholder="0.00" />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Certification</label>
                <textarea value={formData.certification} onChange={(e) => setFormData({...formData, certification: e.target.value})} className="input" rows={2} placeholder="Certifications, licenses, etc." />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTrainer ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}