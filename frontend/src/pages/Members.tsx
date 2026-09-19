import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchMembers, createMember, updateMember, deleteMember } from '../store/membersSlice';
import { fetchPlans } from '../store/plansSlice';
import { fetchTrainers } from '../store/trainersSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { formatDate, getStatusColor, cn } from '../utils/helpers';
import { MembershipStatus } from '../types';

export default function Members() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: members, isLoading } = useAppSelector((state) => state.members);
  const { items: plans } = useAppSelector((state) => state.plans);
  const { items: trainers } = useAppSelector((state) => state.trainers);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    membership_number: '',
    membership_plan_id: '',
    trainer_id: '',
    password: 'member123',
  });

  useEffect(() => {
    dispatch(fetchMembers({}));
    dispatch(fetchPlans(true));
    dispatch(fetchTrainers());
  }, [dispatch]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      member.membership_number.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.membership_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await dispatch(updateMember({
          id: editingMember.id,
          data: {
            membership_plan_id: formData.membership_plan_id ? parseInt(formData.membership_plan_id) : undefined,
            trainer_id: formData.trainer_id ? parseInt(formData.trainer_id) : undefined,
          },
        })).unwrap();
        toast.success('Member updated successfully');
      } else {
        await dispatch(createMember({
          user: { email: formData.email, password: formData.password, full_name: formData.full_name, phone: formData.phone, role: 'member' },
          membership_number: formData.membership_number,
          membership_plan_id: parseInt(formData.membership_plan_id),
          trainer_id: formData.trainer_id ? parseInt(formData.trainer_id) : undefined,
        })).unwrap();
        toast.success('Member created successfully');
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      full_name: member.user.full_name,
      email: member.user.email,
      phone: member.user.phone || '',
      membership_number: member.membership_number,
      membership_plan_id: member.membership_plan_id?.toString() || '',
      trainer_id: member.trainer_id?.toString() || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this member?')) {
      try {
        await dispatch(deleteMember(id)).unwrap();
        toast.success('Member deleted');
      } catch (error: any) {
        toast.error(error || 'Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      membership_number: '',
      membership_plan_id: '',
      trainer_id: '',
      password: 'member123',
    });
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Members</h1>
          <p className="text-dark-500 mt-1">Manage gym members and their profiles</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input pl-10 pr-8 w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
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
                    <th className="text-left p-4 font-medium text-dark-500">Member</th>
                    <th className="text-left p-4 font-medium text-dark-500 hidden md:table-cell">Contact</th>
                    <th className="text-left p-4 font-medium text-dark-500 hidden lg:table-cell">Plan</th>
                    <th className="text-left p-4 font-medium text-dark-500">Status</th>
                    <th className="text-left p-4 font-medium text-dark-500">Joined</th>
                    <th className="text-right p-4 font-medium text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-dark-500">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="member-row hover:bg-dark-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {member.user.full_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-dark-900">{member.user.full_name}</p>
                              <p className="text-sm text-dark-500">{member.membership_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-dark-600">
                              <Mail className="w-4 h-4" />
                              {member.user.email}
                            </div>
                            {member.user.phone && (
                              <div className="flex items-center gap-1 text-sm text-dark-600">
                                <Phone className="w-4 h-4" />
                                {member.user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-dark-600">
                          {member.membership_plan_id ? plans.find(p => p.id === member.membership_plan_id)?.name : 'No Plan'}
                        </td>
                        <td className="p-4">
                          <span className={cn('badge', getStatusColor(member.membership_status))}>
                            {member.membership_status}
                          </span>
                        </td>
                        <td className="p-4 text-dark-600">{formatDate(member.joined_date)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/members/${member.id}`)}
                              className="p-2 rounded-lg text-dark-500 hover:bg-dark-200 hover:text-dark-700 transition-colors"
                              aria-label="View details"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 rounded-lg text-dark-500 hover:bg-dark-200 hover:text-dark-700 transition-colors"
                              aria-label="Edit member"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              aria-label="Delete member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredMembers.length > 0 && (
              <div className="p-4 border-t border-dark-200 flex items-center justify-between">
                <p className="text-sm text-dark-500">
                  Showing {filteredMembers.length} of {members.length} members
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-900">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <div>
                <label className="label">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Membership Number</label>
                  <input type="text" value={formData.membership_number} onChange={(e) => setFormData({...formData, membership_number: e.target.value})} className="input" required />
                </div>
                {!editingMember && (
                  <div>
                    <label className="label">Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" required minLength={8} />
                  </div>
                )}
              </div>
              <div>
                <label className="label">Membership Plan</label>
                <select value={formData.membership_plan_id} onChange={(e) => setFormData({...formData, membership_plan_id: e.target.value})} className="input" required>
                  <option value="">Select Plan</option>
                  {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}/{plan.duration_days} days</option>)}
                </select>
              </div>
              <div>
                <label className="label">Trainer (Optional)</label>
                <select value={formData.trainer_id} onChange={(e) => setFormData({...formData, trainer_id: e.target.value})} className="input">
                  <option value="">No Trainer</option>
                  {trainers.filter(t => t.is_active).map(trainer => <option key={trainer.id} value={trainer.id}>{trainer.user.full_name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMember ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}