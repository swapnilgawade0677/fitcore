import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchInquiries, createInquiry, updateInquiry } from '../store/inquiriesSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2, Mail, CheckCircle, Clock } from 'lucide-react';
import { formatDate, getStatusColor, cn } from '../utils/helpers';

export default function Inquiries() {
  const dispatch = useAppDispatch();
  const { items: inquiries, isLoading } = useAppSelector((state) => state.inquiries);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<any>(null);
  const [formData, setFormData] = useState({ subject: '', message: '', status: 'open', response: '' });

  useEffect(() => { dispatch(fetchInquiries({})); }, [dispatch]);
  /* entrance handled by CSS (animate-fade-in) */

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = i.subject.toLowerCase().includes(search.toLowerCase()) || i.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInquiry) { await dispatch(updateInquiry({ id: editingInquiry.id, data: formData })).unwrap(); toast.success('Inquiry updated'); }
      else { await dispatch(createInquiry({ subject: formData.subject, message: formData.message })).unwrap(); toast.success('Inquiry submitted'); }
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error(error || 'Operation failed'); }
  };

  const handleEdit = (inquiry: any) => { setEditingInquiry(inquiry); setFormData({ subject: inquiry.subject, message: inquiry.message, status: inquiry.status, response: inquiry.response || '' }); setShowModal(true); };
  const resetForm = () => { setEditingInquiry(null); setFormData({ subject: '', message: '', status: 'open', response: '' }); };
  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Inquiries & Complaints</h1><p className="text-dark-500 mt-1">{isAdmin ? 'Manage member inquiries and complaints' : 'Submit and track your inquiries'}</p></div>
        {!isAdmin && <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />New Inquiry</button>}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-6"><p className="text-sm text-dark-500">Total</p><p className="text-3xl font-bold text-dark-900 mt-1">{inquiries.length}</p></div>
          <div className="card p-6"><p className="text-sm text-dark-500">Open</p><p className="text-3xl font-bold text-blue-600 mt-1">{inquiries.filter(i => i.status === 'open').length}</p></div>
          <div className="card p-6"><p className="text-sm text-dark-500">In Progress</p><p className="text-3xl font-bold text-yellow-600 mt-1">{inquiries.filter(i => i.status === 'in_progress').length}</p></div>
          <div className="card p-6"><p className="text-sm text-dark-500">Resolved</p><p className="text-3xl font-bold text-green-600 mt-1">{inquiries.filter(i => i.status === 'resolved').length}</p></div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search inquiries..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="input pl-10 pr-8 w-auto"><option value="all">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200"/>)}</div>
        ) : (
          <>
            <div className="divide-y divide-dark-200">
              {filteredInquiries.map((inquiry, i) => (
                <div key={i} className="inquiry-row p-4 hover:bg-dark-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-dark-900">{inquiry.subject}</h3>
                        <span className={cn('badge', getStatusColor(inquiry.status))}>{inquiry.status.replace('_',' ')}</span>
                      </div>
                      <p className="text-dark-600 line-clamp-2">{inquiry.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-dark-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{formatDate(inquiry.created_at)}</span>
                        {inquiry.responded_at && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500"/>Responded: {formatDate(inquiry.responded_at)}</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={()=>handleEdit(inquiry)} className="btn-secondary text-sm"><Mail className="w-4 h-4 mr-1"/>Reply</button>
                      </div>
                    )}
                  </div>
                  {inquiry.response && (
                    <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 text-sm text-green-400 mb-2"><CheckCircle className="w-4 h-4"/>Admin Response</div>
                      <p className="text-green-300">{inquiry.response}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredInquiries.length === 0 && <div className="text-center py-12 text-dark-500">No inquiries found</div>}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">{editingInquiry?'Reply to':'Submit'} Inquiry</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Subject</label><input type="text" value={formData.subject} onChange={e=>setFormData({...formData,subject:e.target.value})} className="input" required/></div>
              <div><label className="label">Message</label><textarea value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})} className="input" rows={4} required/></div>
              {isAdmin && editingInquiry && (
                <>
                  <div><label className="label">Status</label><select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} className="input"><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
                  <div><label className="label">Response</label><textarea value={formData.response} onChange={e=>setFormData({...formData,response:e.target.value})} className="input" rows={3} placeholder="Your response to the member"/></div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:(editingInquiry?'Update':'Submit')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}