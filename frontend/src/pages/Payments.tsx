import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPayments, createPayment, updatePayment } from '../store/paymentsSlice';
import { fetchMembers } from '../store/membersSlice';
import { fetchPlans } from '../store/plansSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, DollarSign, Loader2, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, cn } from '../utils/helpers';
import { PaymentStatus } from '../types';

export default function Payments() {
  const dispatch = useAppDispatch();
  const { items: payments, isLoading } = useAppSelector((state) => state.payments);
  const { items: members } = useAppSelector((state) => state.members);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [formData, setFormData] = useState({ member_id: '', amount: '', due_date: new Date().toISOString().split('T')[0], status: 'pending' as PaymentStatus, payment_method: '', transaction_id: '', notes: '' });

  useEffect(() => { dispatch(fetchPayments({ limit: 100 })); dispatch(fetchMembers({ limit: 1000 })); dispatch(fetchPlans(true)); }, [dispatch]);
  /* entrance handled by CSS (animate-fade-in) */

  const filteredPayments = payments.filter(p => {
    const member = members.find(m => m.id === p.member_id);
    const matchesSearch = member?.user.full_name.toLowerCase().includes(search.toLowerCase()) || p.transaction_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, member_id: parseInt(formData.member_id), amount: parseFloat(formData.amount) };
      if (editingPayment) { await dispatch(updatePayment({ id: editingPayment.id, data })).unwrap(); toast.success('Payment updated'); }
      else { await dispatch(createPayment(data)).unwrap(); toast.success('Payment recorded'); }
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error(error || 'Operation failed'); }
  };

  const handleEdit = (payment: any) => { setEditingPayment(payment); setFormData({ member_id: payment.member_id.toString(), amount: payment.amount, due_date: payment.due_date.split('T')[0], status: payment.status, payment_method: payment.payment_method || '', transaction_id: payment.transaction_id || '', notes: payment.notes || '' }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (confirm('Delete this payment?')) { try { await dispatch(updatePayment({ id, data: { status: 'cancelled' } })).unwrap(); toast.success('Payment cancelled'); } catch (e: any) { toast.error(e); } } };
  const resetForm = () => { setEditingPayment(null); setFormData({ member_id: '', amount: '', due_date: new Date().toISOString().split('T')[0], status: 'pending', payment_method: '', transaction_id: '', notes: '' }); };
  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Payments</h1><p className="text-dark-500 mt-1">Manage member payments and billing</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Record Payment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6"><p className="text-sm text-dark-500">Total Collected</p><p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Pending</p><p className="text-3xl font-bold text-yellow-600 mt-1">{formatCurrency(totalPending)}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Total Transactions</p><p className="text-3xl font-bold text-dark-900 mt-1">{payments.length}</p></div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search payments..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="input pl-10 pr-8 w-auto"><option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option><option value="overdue">Overdue</option></select></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200 flex items-center justify-between"><div className="h-4 bg-dark-200 rounded w-1/4"/><div className="h-6 bg-dark-200 rounded w-24"/></div>)}</div> : (
          <>
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-dark-200 bg-dark-50"><th className="text-left p-4 font-medium text-dark-500">Member</th><th className="text-left p-4 font-medium text-dark-500">Amount</th><th className="text-left p-4 font-medium text-dark-500">Due Date</th><th className="text-left p-4 font-medium text-dark-500">Status</th><th className="text-left p-4 font-medium text-dark-500">Method</th><th className="text-right p-4 font-medium text-dark-500">Actions</th></tr></thead><tbody className="divide-y divide-dark-200">{filteredPayments.map((p, i) => { const member = members.find(m => m.id === p.member_id); return <tr key={i} className="payment-row hover:bg-dark-50"><td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-sm font-medium text-primary-600">{member?.user.full_name.split(' ').map(n=>n[0]).join('')}</span></div><div><p className="font-medium text-dark-900">{member?.user.full_name}</p><p className="text-sm text-dark-500">{member?.membership_number}</p></div></div></td><td className="p-4 font-medium">{formatCurrency(p.amount)}</td><td className="p-4">{formatDate(p.due_date)}</td><td className="p-4"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td><td className="p-4">{p.payment_method || '-'}</td><td className="p-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={()=>handleEdit(p)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><Edit className="w-4 h-4"/></button><button onClick={()=>handleDelete(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button></div></td></tr>;})}{filteredPayments.length===0 && <tr><td colSpan={6} className="text-center py-12 text-dark-500">No payments found</td></tr>}</tbody></table></div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">{editingPayment?'Edit':'Record'} Payment</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Member</label><select value={formData.member_id} onChange={e=>setFormData({...formData,member_id:e.target.value})} className="input" required><option value="">Select Member</option>{members.map(m=><option key={m.id} value={m.id}>{m.user.full_name} - {m.membership_number}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Amount</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="number" step="0.01" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})} className="input pl-10" min="0" required/></div></div><div><label className="label">Due Date</label><input type="date" value={formData.due_date} onChange={e=>setFormData({...formData,due_date:e.target.value})} className="input" required/></div></div>
              <div><label className="label">Status</label><select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value as PaymentStatus})} className="input"><option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="overdue">Overdue</option></select></div>
              <div><label className="label">Payment Method</label><input type="text" value={formData.payment_method} onChange={e=>setFormData({...formData,payment_method:e.target.value})} className="input" placeholder="Cash, Card, Bank Transfer"/></div>
              <div><label className="label">Transaction ID</label><input type="text" value={formData.transaction_id} onChange={e=>setFormData({...formData,transaction_id:e.target.value})} className="input"/></div>
              <div><label className="label">Notes</label><textarea value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} className="input" rows={2}/></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:(editingPayment?'Update':'Record')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}