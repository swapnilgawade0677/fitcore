import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchAttendance, markAttendance } from '../store/attendanceSlice';
import { fetchMembers } from '../store/membersSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Calendar, CheckCircle, Clock, Loader2, QrCode, Download } from 'lucide-react';
import { formatDate, formatTime } from '../utils/helpers';

export default function Attendance() {
  const dispatch = useAppDispatch();
  const { items: attendance, isLoading } = useAppSelector((state) => state.attendance);
  const { items: members } = useAppSelector((state) => state.members);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    dispatch(fetchAttendance({ limit: 100 }));
    dispatch(fetchMembers({ limit: 1000 }));
  }, [dispatch]);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = user?.role === 'member' ? members.find(m => m.user_id === user.id)?.id : parseInt(selectedMemberId);
    if (!memberId) return toast.error('Member not found');
    try {
      await dispatch(markAttendance({ member_id: memberId, qr_code_used: 'manual' })).unwrap();
      toast.success('Attendance marked successfully');
      setShowMarkModal(false);
    } catch (error: any) { toast.error(error || 'Failed to mark attendance'); }
  };

  const filteredAttendance = attendance.filter(a => {
    const matchesSearch = a.member_id && members.find(m => m.id === a.member_id)?.user.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || a.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Attendance</h1><p className="text-dark-500 mt-1">Track member check-ins and check-outs</p></div>
        <div className="flex gap-2">
          {user?.role !== 'member' && (
            <button onClick={() => { setSelectedMemberId(''); setShowMarkModal(true); }} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Mark Attendance</button>
          )}
          <button className="btn-secondary"><Download className="w-4 h-4 mr-2" />Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-6"><p className="text-sm text-dark-500">Today's Check-ins</p><p className="text-3xl font-bold text-dark-900 mt-1">{todayAttendance}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">This Week</p><p className="text-3xl font-bold text-dark-900 mt-1">{attendance.filter(a => new Date(a.date) > new Date(Date.now()-7*24*60*60*1000)).length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">This Month</p><p className="text-3xl font-bold text-dark-900 mt-1">{attendance.filter(a => new Date(a.date) > new Date(Date.now()-30*24*60*60*1000)).length}</p></div>
        <div className="card p-6"><p className="text-sm text-dark-500">Total Records</p><p className="text-3xl font-bold text-dark-900 mt-1">{attendance.length}</p></div>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search members..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div>
          <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="input pl-10 pr-8 w-auto"/></div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        {isLoading ? <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-dark-200"/><div className="flex-1 space-y-2"><div className="h-4 bg-dark-200 rounded w-1/4"/><div className="h-3 bg-dark-200 rounded w-1/3"/></div></div>)}</div> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-dark-200 bg-dark-50"><th className="text-left p-4 font-medium text-dark-500">Member</th><th className="text-left p-4 font-medium text-dark-500">Date</th><th className="text-left p-4 font-medium text-dark-500">Check In</th><th className="text-left p-4 font-medium text-dark-500">Check Out</th><th className="text-left p-4 font-medium text-dark-500">Method</th></tr></thead>
                <tbody className="divide-y divide-dark-200">
                  {filteredAttendance.map((a, i) => {
                    const member = members.find(m => m.id === a.member_id);
                    return <tr key={i} className="attendance-row hover:bg-dark-50"><td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-sm font-medium text-primary-600">{member?.user.full_name.split(' ').map(n=>n[0]).join('')}</span></div><div><p className="font-medium text-dark-900">{member?.user.full_name}</p><p className="text-sm text-dark-500">{member?.membership_number}</p></div></div></td><td className="p-4">{formatDate(a.date)}</td><td className="p-4"><div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>{formatTime(a.check_in_time)}</div></td><td className="p-4">{a.check_out_time ? <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-dark-400"/>{formatTime(a.check_out_time)}</div> : <span className="text-dark-400">Still inside</span>}</td><td className="p-4">{a.qr_code_used === 'manual' ? 'Manual' : 'QR Code'}</td></tr>;
                  })}
                  {filteredAttendance.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-dark-500">No attendance records found</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-md w-full">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">Mark Attendance</h2><button onClick={()=>setShowMarkModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleMarkAttendance} className="p-6 space-y-4">
              {user?.role !== 'member' && (
                <div><label className="label">Member</label><select value={selectedMemberId} onChange={e=>setSelectedMemberId(e.target.value)} className="input" required><option value="">Select Member</option>{members.map(m=><option key={m.id} value={m.id}>{m.user.full_name} - {m.membership_number}</option>)}</select></div>
              )}
              <div className="text-center py-4">
                <QrCode className="w-16 h-16 mx-auto text-dark-300 mb-2"/>
                <p className="text-dark-500">Scan QR code or mark manually</p>
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={()=>setShowMarkModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:'Mark Attendance'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}