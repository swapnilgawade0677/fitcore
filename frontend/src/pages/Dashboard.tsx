import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchDashboardStats } from '../store/dashboardSlice';
import { fetchMembers } from '../store/membersSlice';
import { fetchAttendance } from '../store/attendanceSlice';
import { formatCurrency, getStatusColor, cn } from '../utils/helpers';
import { Users, Dumbbell, Calendar, CreditCard, Clock, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const statCards = [
  { name: 'Total Members', key: 'total_members', icon: Users, color: 'bg-blue-500', trend: '+12%', trendUp: true },
  { name: 'Active Members', key: 'active_members', icon: Users, color: 'bg-green-500', trend: '+8%', trendUp: true },
  { name: 'Total Trainers', key: 'total_trainers', icon: Dumbbell, color: 'bg-purple-500', trend: '+2%', trendUp: true },
  { name: 'Active Plans', key: 'active_plans', icon: Calendar, color: 'bg-orange-500', trend: '+5%', trendUp: true },
  { name: 'Total Revenue', key: 'total_revenue', icon: CreditCard, color: 'bg-emerald-500', trend: '+23%', trendUp: true, isCurrency: true },
  { name: 'Pending Payments', key: 'pending_payments', icon: Clock, color: 'bg-yellow-500', trend: '-3%', trendUp: false },
  { name: 'Today Attendance', key: 'today_attendance', icon: Activity, color: 'bg-indigo-500', trend: '+15%', trendUp: true },
  { name: 'Equipment Maintenance', key: 'equipment_under_maintenance', icon: Dumbbell, color: 'bg-red-500', trend: '0%', trendUp: false },
];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchMembers({ limit: 5 }));
    dispatch(fetchAttendance({ limit: 5 }));
  }, [dispatch]);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="stat-card card p-6 animate-pulse">
            <div className="h-4 bg-dark-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-dark-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-dark-500 mt-1">Here's what's happening at your gym today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-500">
          <Activity className="w-4 h-4" />
          <span>Live updates enabled</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {statCards.map((stat) => (
          <div key={stat.key} className="stat-card card p-5">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', stat.color)}>
              <stat.icon className="w-5 h-5 text-white flex-shrink-0" />
            </div>
            <p className="text-sm font-medium text-dark-500 leading-snug">{stat.name}</p>
            <p className={cn('text-2xl font-bold mt-1', stat.key === 'total_revenue' ? 'text-primary-500' : 'text-dark-900')}>
              {stat.isCurrency ? formatCurrency(stats?.[stat.key as keyof typeof stats] ?? 0) : stats?.[stat.key as keyof typeof stats] ?? 0}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs whitespace-nowrap">
              <span className={cn('inline-flex items-center font-medium', stat.trendUp ? 'text-green-500' : 'text-red-500')}>
                {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </span>
              <span className="text-dark-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="chart-card card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900">Weekly Attendance</h2>
            <select className="input py-1 px-3 text-sm w-auto">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-around gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                  style={{ height: `${[45, 65, 55, 75, 85, 40, 30][i]}%` }}
                />
                <span className="text-xs text-dark-500">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="chart-card card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900">Monthly Revenue</h2>
            <select className="input py-1 px-3 text-sm w-auto">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD21F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFD21F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M20,180 L60,140 L100,160 L140,100 L180,120 L220,80 L260,90 L300,60 L340,70 L380,50"
                stroke="#FFD21F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20,180 L60,140 L100,160 L140,100 L180,120 L220,80 L260,90 L300,60 L340,70 L380,50 L380,200 L20,200 Z"
                fill="url(#revenueGradient)"
              />
              {[180, 140, 100, 80, 60, 50].map((y, i) => (
                <circle key={i} cx={20 + i * 72} cy={y} r="4" fill="#FFD21F" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-dark-400 px-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-dark-900">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add New Member', href: '/members', icon: Users },
              { label: 'Mark Attendance', href: '/attendance', icon: Calendar },
              { label: 'Record Payment', href: '/payments', icon: CreditCard },
              { label: 'Create Workout Plan', href: '/workouts', icon: Activity },
              { label: 'Add Equipment', href: '/equipment', icon: Dumbbell },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="card-hover flex items-center gap-3 p-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 group-hover:bg-primary-200 transition-colors flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-primary-600" />
                </div>
                <span className="font-medium text-dark-900 group-hover:text-primary-600 transition-colors">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-dark-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-900">Recent Members</h2>
            <a href="/members" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200">
                  <th className="text-left p-4 font-medium text-dark-500">Member</th>
                  <th className="text-left p-4 font-medium text-dark-500 hidden md:table-cell">Plan</th>
                  <th className="text-left p-4 font-medium text-dark-500 hidden lg:table-cell">Status</th>
                  <th className="text-left p-4 font-medium text-dark-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {[
                  { name: 'Sarah Johnson', plan: 'Premium Annual', status: 'active', joined: '2024-01-15' },
                  { name: 'Michael Chen', plan: 'Basic Monthly', status: 'active', joined: '2024-01-10' },
                  { name: 'Emily Davis', plan: 'Pro Quarterly', status: 'pending', joined: '2024-01-08' },
                  { name: 'James Wilson', plan: 'Premium Annual', status: 'active', joined: '2024-01-05' },
                  { name: 'Lisa Anderson', plan: 'Basic Monthly', status: 'expired', joined: '2023-12-20' },
                ].map((member, i) => (
                  <tr key={i} className="hover:bg-dark-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-dark-900">{member.name}</p>
                          <p className="text-sm text-dark-500">Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-dark-600">{member.plan}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={cn('badge', getStatusColor(member.status))}>{member.status}</span>
                    </td>
                    <td className="p-4 text-dark-600">{member.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}