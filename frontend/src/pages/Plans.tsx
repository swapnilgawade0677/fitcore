import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPlans, createPlan, updatePlan, deletePlan } from '../store/plansSlice';
import toast from 'react-hot-toast';
import { Plus, Loader2, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, cn } from '../utils/helpers';

export default function Plans() {
  const dispatch = useAppDispatch();
  const { items: plans, isLoading } = useAppSelector((state) => state.plans);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', duration_days: '30', price: '0', features: '', is_active: true,
  });

  useEffect(() => { dispatch(fetchPlans(true)); }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: parseFloat(formData.price), duration_days: parseInt(formData.duration_days) };
      if (editingPlan) { await dispatch(updatePlan({ id: editingPlan.id, data })).unwrap(); toast.success('Plan updated'); }
      else { await dispatch(createPlan(data)).unwrap(); toast.success('Plan created'); }
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error(error || 'Operation failed'); }
  };

  const handleEdit = (plan: any) => { setEditingPlan(plan); setFormData({ name: plan.name, description: plan.description || '', duration_days: plan.duration_days.toString(), price: plan.price.toString(), features: plan.features || '', is_active: plan.is_active }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (confirm('Delete this plan?')) { try { await dispatch(deletePlan(id)).unwrap(); toast.success('Plan deleted'); } catch (e: any) { toast.error(e); } } };
  const resetForm = () => { setEditingPlan(null); setFormData({ name: '', description: '', duration_days: '30', price: '0', features: '', is_active: true }); };
  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Membership Plans</h1><p className="text-dark-500 mt-1">Manage membership plans and pricing</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Add Plan</button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">{Array.from({length:4}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200 flex items-center justify-between"><div className="h-4 bg-dark-200 rounded w-1/4"/><div className="h-6 bg-dark-200 rounded w-24"/></div>)}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-dark-200 bg-dark-50"><th className="text-left p-4 font-medium text-dark-500">Plan</th><th className="text-left p-4 font-medium text-dark-500">Duration</th><th className="text-left p-4 font-medium text-dark-500">Price</th><th className="text-left p-4 font-medium text-dark-500">Status</th><th className="text-right p-4 font-medium text-dark-500">Actions</th></tr></thead>
                <tbody className="divide-y divide-dark-200">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="plan-row hover:bg-dark-50">
                      <td className="p-4"><p className="font-medium text-dark-900">{plan.name}</p><p className="text-sm text-dark-500 line-clamp-1">{plan.description || 'No description'}</p></td>
                      <td className="p-4"><div className="flex items-center gap-1 text-dark-600"><Calendar className="w-4 h-4"/>{plan.duration_days} days</div></td>
                      <td className="p-4"><div className="flex items-center gap-1 font-medium text-dark-900"><DollarSign className="w-4 h-4"/>{formatCurrency(plan.price)}</div></td>
                      <td className="p-4"><span className={cn('badge', plan.is_active ? 'badge-success' : 'badge-danger')}>{plan.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="p-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={()=>handleEdit(plan)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><Edit className="w-4 h-4"/></button><button onClick={()=>handleDelete(plan.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button></div></td>
                    </tr>
                  ))}
                  {plans.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-dark-500">No plans found</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">{editingPlan?'Edit':'Create'} Plan</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Plan Name</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="input" required/></div>
              <div><label className="label">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className="input" rows={3}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Duration (days)</label><input type="number" value={formData.duration_days} onChange={e=>setFormData({...formData,duration_days:e.target.value})} className="input" min={1} required/></div>
                <div><label className="label">Price</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData,price:e.target.value})} className="input pl-10" min={0} required/></div></div>
              </div>
              <div><label className="label">Features (one per line)</label><textarea value={formData.features} onChange={e=>setFormData({...formData,features:e.target.value})} className="input" rows={3} placeholder="24/7 Access&#10;Personal Trainer&#10;Group Classes"/></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={formData.is_active} onChange={e=>setFormData({...formData,is_active:e.target.checked})} className="w-4 h-4 rounded border-dark-300 text-primary-600"/><label htmlFor="active" className="text-sm text-dark-600">Active</label></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:(editingPlan?'Update':'Create')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}