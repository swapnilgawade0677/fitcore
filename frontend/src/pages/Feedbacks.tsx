import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchFeedbacks, createFeedback } from '../store/feedbacksSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2, Star, User } from 'lucide-react';
import { formatDate, cn } from '../utils/helpers';

export default function Feedbacks() {
  const dispatch = useAppDispatch();
  const { items: feedbacks, isLoading } = useAppSelector((state) => state.feedbacks);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '', category: '' });

  useEffect(() => { dispatch(fetchFeedbacks({})); }, [dispatch]);
  /* entrance handled by CSS (animate-fade-in) */

  const categories = [...new Set(feedbacks.map(f => f.category).filter((c): c is string => Boolean(c)))];
  const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0';

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.comment?.toLowerCase().includes(search.toLowerCase()) || f.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createFeedback({ rating: formData.rating, comment: formData.comment, category: formData.category })).unwrap();
      toast.success('Feedback submitted');
      setShowModal(false);
      setFormData({ rating: 5, comment: '', category: '' });
    } catch (error: any) { toast.error(error || 'Failed to submit'); }
  };

  const openModal = () => { setFormData({ rating: 5, comment: '', category: '' }); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Feedback</h1><p className="text-dark-500 mt-1">Member feedback and ratings</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Give Feedback</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6"><p className="text-sm text-dark-500">Average Rating</p><div className="flex items-baseline gap-2 mt-1"><span className="text-4xl font-bold text-dark-900">{avgRating}</span><div className="flex text-yellow-400">{[1,2,3,4,5].map(i=><Star key={i} className={i<=Math.round(Number(avgRating)) ? 'fill-current' : ''} />)}</div></div></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Total Feedback</p><p className="text-3xl font-bold text-dark-900 mt-1">{feedbacks.length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">5-Star Reviews</p><p className="text-3xl font-bold text-yellow-600 mt-1">{feedbacks.filter(f=>f.rating===5).length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Categories</p><p className="text-3xl font-bold text-dark-900 mt-1">{categories.length}</p></div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search feedback..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div>
          <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="input pl-10 pr-8 w-auto"><option value="">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200"/>)}</div>
        ) : (
          <>
            <div className="divide-y divide-dark-200">
              {filteredFeedbacks.map((feedback, i) => (
                <div key={i} className="feedback-row p-4 hover:bg-dark-50">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-primary-600"/></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex text-yellow-400">{[1,2,3,4,5].map(s=><Star key={s} className={s<=feedback.rating ? 'fill-current' : ''} size={16}/>)}</div>
                        {feedback.category && <span className={cn('badge', 'badge-info')}>{feedback.category}</span>}
                      </div>
                      {feedback.comment && <p className="text-dark-600 mb-2">{feedback.comment}</p>}
                      <p className="text-sm text-dark-500">{formatDate(feedback.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredFeedbacks.length === 0 && <div className="text-center py-12 text-dark-500">No feedback yet</div>}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">Submit Feedback</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="label">Rating</label><div className="flex gap-2">{[1,2,3,4,5].map(star=><button type="button" onClick={()=>setFormData({...formData,rating:star})} className={`p-2 rounded-lg transition-colors ${formData.rating>=star ? 'bg-primary-500/15 text-primary-500' : 'bg-dark-100 text-dark-400 hover:bg-dark-200'}`}><Star className="w-6 h-6 fill-current"/></button>)}</div></div>
              <div><label className="label">Category (Optional)</label><select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="input"><option value="">General</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="label">Comment (Optional)</label><textarea value={formData.comment} onChange={e=>setFormData({...formData,comment:e.target.value})} className="input" rows={3} placeholder="Share your experience..."/></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Submit Feedback'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}