import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEquipment, createEquipment, updateEquipment, deleteEquipment } from '../store/equipmentSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import { formatDate, getStatusColor, cn } from '../utils/helpers';
import { EquipmentStatus } from '../types';

export default function Equipment() {
  const dispatch = useAppDispatch();
  const { items: equipment, isLoading } = useAppSelector((state) => state.equipment);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', brand: '', model: '', serial_number: '', purchase_date: '', warranty_expiry: '', status: 'available' as EquipmentStatus, location: '', last_maintenance: '', next_maintenance: '' });

  useEffect(() => { dispatch(fetchEquipment({})); }, [dispatch]);
  /* entrance handled by CSS (animate-fade-in) */

  const categories = [...new Set(equipment.map(e => e.category).filter((c): c is string => Boolean(c)))];

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.brand?.toLowerCase().includes(search.toLowerCase()) || e.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCategory = !categoryFilter || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, purchase_date: formData.purchase_date || null, warranty_expiry: formData.warranty_expiry || null, last_maintenance: formData.last_maintenance || null, next_maintenance: formData.next_maintenance || null };
      if (editingEquipment) { await dispatch(updateEquipment({ id: editingEquipment.id, data })).unwrap(); toast.success('Equipment updated'); }
      else { await dispatch(createEquipment(data)).unwrap(); toast.success('Equipment added'); }
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error(error || 'Operation failed'); }
  };

  const handleEdit = (eq: any) => { setEditingEquipment(eq); setFormData({ name: eq.name, description: eq.description || '', category: eq.category || '', brand: eq.brand || '', model: eq.model || '', serial_number: eq.serial_number || '', purchase_date: eq.purchase_date || '', warranty_expiry: eq.warranty_expiry || '', status: eq.status, location: eq.location || '', last_maintenance: eq.last_maintenance || '', next_maintenance: eq.next_maintenance || '' }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (confirm('Delete this equipment?')) { try { await dispatch(deleteEquipment(id)).unwrap(); toast.success('Equipment deleted'); } catch (e: any) { toast.error(e); } } };
  const resetForm = () => { setEditingEquipment(null); setFormData({ name: '', description: '', category: '', brand: '', model: '', serial_number: '', purchase_date: '', warranty_expiry: '', status: 'available', location: '', last_maintenance: '', next_maintenance: '' }); };
  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Equipment</h1><p className="text-dark-500 mt-1">Manage gym equipment and maintenance</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Add Equipment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6"><p className="text-sm text-dark-500">Total Equipment</p><p className="text-3xl font-bold text-dark-900 mt-1">{equipment.length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Available</p><p className="text-3xl font-bold text-green-600 mt-1">{equipment.filter(e => e.status === 'available').length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Maintenance</p><p className="text-3xl font-bold text-yellow-600 mt-1">{equipment.filter(e => e.status === 'maintenance').length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Out of Order</p><p className="text-3xl font-bold text-red-600 mt-1">{equipment.filter(e => e.status === 'out_of_order').length}</p></div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="input pl-10 pr-8 w-auto"><option value="all">All Status</option><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="out_of_order">Out of Order</option></select></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="input pl-10 pr-8 w-auto"><option value="">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200 flex items-center justify-between"><div className="h-4 bg-dark-200 rounded w-1/4"/><div className="h-6 bg-dark-200 rounded w-24"/></div>)}</div> : (
          <>
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-dark-200 bg-dark-50"><th className="text-left p-4 font-medium text-dark-500">Equipment</th><th className="text-left p-4 font-medium text-dark-500 hidden md:table-cell">Category</th><th className="text-left p-4 font-medium text-dark-500">Brand/Model</th><th className="text-left p-4 font-medium text-dark-500">Status</th><th className="text-left p-4 font-medium text-dark-500 hidden lg:table-cell">Maintenance</th><th className="text-right p-4 font-medium text-dark-500">Actions</th></tr></thead><tbody className="divide-y divide-dark-200">{filteredEquipment.map((eq, i) => <tr key={i} className="equip-row hover:bg-dark-50"><td className="p-4"><p className="font-medium text-dark-900">{eq.name}</p>{eq.serial_number && <p className="text-sm text-dark-500">SN: {eq.serial_number}</p>}</td><td className="p-4 hidden md:table-cell">{eq.category || '-'}</td><td className="p-4">{eq.brand || '-'} / {eq.model || '-'}</td><td className="p-4"><span className={cn('badge', getStatusColor(eq.status))}>{eq.status.replace('_',' ')}</span></td><td className="p-4 hidden lg:table-cell"><div className="flex items-center gap-1 text-sm text-dark-500"><Calendar className="w-3 h-3"/>{eq.next_maintenance ? formatDate(eq.next_maintenance) : 'Not scheduled'}</div></td><td className="p-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={()=>handleEdit(eq)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><Edit className="w-4 h-4"/></button><button onClick={()=>handleDelete(eq.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button></div></td></tr>)}{filteredEquipment.length===0 && <tr><td colSpan={6} className="text-center py-12 text-dark-500">No equipment found</td></tr>}</tbody></table></div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">{editingEquipment?'Edit':'Add'} Equipment</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Name</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="input" required/></div>
              <div><label className="label">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className="input" rows={2}/></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Category</label><input type="text" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="input" list="categories"/><datalist id="categories">{categories.map(c=><option key={c} value={c}/>)}</datalist></div><div><label className="label">Brand</label><input type="text" value={formData.brand} onChange={e=>setFormData({...formData,brand:e.target.value})} className="input"/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Model</label><input type="text" value={formData.model} onChange={e=>setFormData({...formData,model:e.target.value})} className="input"/></div><div><label className="label">Serial Number</label><input type="text" value={formData.serial_number} onChange={e=>setFormData({...formData,serial_number:e.target.value})} className="input"/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Purchase Date</label><input type="date" value={formData.purchase_date} onChange={e=>setFormData({...formData,purchase_date:e.target.value})} className="input"/></div><div><label className="label">Warranty Expiry</label><input type="date" value={formData.warranty_expiry} onChange={e=>setFormData({...formData,warranty_expiry:e.target.value})} className="input"/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Status</label><select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value as EquipmentStatus})} className="input"><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="out_of_order">Out of Order</option></select></div><div><label className="label">Location</label><input type="text" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} className="input"/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Last Maintenance</label><input type="date" value={formData.last_maintenance} onChange={e=>setFormData({...formData,last_maintenance:e.target.value})} className="input"/></div><div><label className="label">Next Maintenance</label><input type="date" value={formData.next_maintenance} onChange={e=>setFormData({...formData,next_maintenance:e.target.value})} className="input"/></div></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:(editingEquipment?'Update':'Add')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}