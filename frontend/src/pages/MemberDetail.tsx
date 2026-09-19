import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchMember } from '../store/membersSlice';
import { fetchAttendance } from '../store/attendanceSlice';
import { fetchPayments } from '../store/paymentsSlice';
import { fetchWorkouts } from '../store/workoutsSlice';
import { formatDate, formatCurrency, getStatusColor, cn } from '../utils/helpers';
import { ArrowLeft, Mail, Phone, Calendar, CreditCard, Activity, ChevronRight } from 'lucide-react';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected: member, isLoading } = useAppSelector((state) => state.members);
  const { items: attendance } = useAppSelector((state) => state.attendance);
  const { items: payments } = useAppSelector((state) => state.payments);
  const { items: workouts } = useAppSelector((state) => state.workouts);

  useEffect(() => {
    if (id) {
      dispatch(fetchMember(parseInt(id)));
      dispatch(fetchAttendance({ member_id: parseInt(id), limit: 10 }));
      dispatch(fetchPayments({ member_id: parseInt(id), limit: 10 }));
      dispatch(fetchWorkouts({ member_id: parseInt(id), active_only: true }));
    }
  }, [id, dispatch]);

  if (isLoading || !member) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-8 bg-dark-200 rounded w-48" />
          <button className="p-2 rounded-lg bg-dark-200" onClick={() => navigate(-1)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="card p-6"><div className="h-4 bg-dark-200 rounded w-1/2 mb-4"/><div className="h-8 bg-dark-200 rounded w-1/4"/></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-dark-900">{member.user.full_name}</h1>
          <p className="text-dark-500">{member.membership_number} • {member.user.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('badge', getStatusColor(member.membership_status))}>{member.membership_status}</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6 detail-section">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center md:flex-shrink-0">
            <span className="text-3xl font-bold text-primary-600">
              {member.user.full_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-dark-500">Email</p>
              <p className="font-medium text-dark-900 flex items-center gap-1"><Mail className="w-4 h-4" />{member.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500">Phone</p>
              <p className="font-medium text-dark-900 flex items-center gap-1"><Phone className="w-4 h-4" />{member.user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500">Joined</p>
              <p className="font-medium text-dark-900 flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(member.joined_date)}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500">Status</p>
              <span className={cn('badge', getStatusColor(member.membership_status))}>{member.membership_status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 detail-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Attendance (30 days)</p>
              <p className="text-3xl font-bold text-dark-900">{attendance.filter(a => new Date(a.date) > new Date(Date.now() - 30*24*60*60*1000)).length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="card p-6 detail-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Total Paid</p>
              <p className="text-3xl font-bold text-dark-900">{formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"><CreditCard className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>
        <div className="card p-6 detail-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Active Workouts</p>
              <p className="text-3xl font-bold text-dark-900">{workouts.filter(w => w.is_active).length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><Activity className="w-6 h-6 text-purple-600" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-dark-200">
          <nav className="flex gap-8 px-6" aria-label="Tabs">
            {['Attendance', 'Payments', 'Workouts'].map((tab) => (
              <button
                key={tab}
                className="py-4 px-1 border-b-2 border-transparent text-dark-500 hover:text-dark-700 font-medium text-sm transition-colors"
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Attendance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-900">Recent Attendance</h3>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-dark-200"><th className="text-left p-3 font-medium text-dark-500">Date</th><th className="text-left p-3 font-medium text-dark-500">Check In</th><th className="text-left p-3 font-medium text-dark-500">Check Out</th></tr></thead>
                <tbody className="divide-y divide-dark-200">
                  {attendance.slice(0, 5).map((a, i) => (
                    <tr key={i}><td className="p-3">{formatDate(a.date)}</td><td className="p-3">{a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString() : '-'}</td><td className="p-3">{a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString() : '-'}</td></tr>
                  ))}
                  {attendance.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-dark-500">No attendance records</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="space-y-4 pt-6 border-t border-dark-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-900">Recent Payments</h3>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-dark-200"><th className="text-left p-3 font-medium text-dark-500">Date</th><th className="text-left p-3 font-medium text-dark-500">Amount</th><th className="text-left p-3 font-medium text-dark-500">Status</th><th className="text-left p-3 font-medium text-dark-500">Method</th></tr></thead>
                <tbody className="divide-y divide-dark-200">
                  {payments.slice(0, 5).map((p, i) => (
                    <tr key={i}><td className="p-3">{formatDate(p.payment_date)}</td><td className="p-3 font-medium">{formatCurrency(p.amount)}</td><td className="p-3"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td><td className="p-3">{p.payment_method || '-'}</td></tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-dark-500">No payment records</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workouts */}
          <div className="space-y-4 pt-6 border-t border-dark-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-900">Active Workout Plans</h3>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
            </div>
            {workouts.filter(w => w.is_active).length === 0 ? (
              <p className="text-center py-8 text-dark-500">No active workout plans</p>
            ) : (
              <div className="space-y-4">
                {workouts.filter(w => w.is_active).map((workout) => (
                  <div key={workout.id} className="card-hover p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-dark-900">{workout.name}</h4>
                        <p className="text-sm text-dark-500">{workout.exercises.length} exercises • {workout.start_date} to {workout.end_date || 'Ongoing'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}