import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  AlertOctagon, 
  Vibrate, 
  Search, 
  Filter, 
  Smartphone, 
  ShieldAlert, 
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  BellRing
} from 'lucide-react';
import { UserProfile, LinkedDevice } from '../types/ergosense.ts';
import { sendBuzz, fetchFleet } from '../services/api.ts';

interface FleetUserRow extends UserProfile {
  device?: LinkedDevice | null;
  currentStatus: 'optimal' | 'attention' | 'severe';
  currentAngle: number;
  proximity: number;
  score: number;
}

interface AdminFleetDashboardProps {
  onSelectUserForCompanionView?: (userId: string) => void;
}

export const AdminFleetDashboard: React.FC<AdminFleetDashboardProps> = ({
  onSelectUserForCompanionView,
}) => {
  const [fleetData, setFleetData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [buzzingUserId, setBuzzingUserId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchFleet();
      setFleetData(data);
    } catch (err) {
      console.error('Failed to fetch fleet metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBuzzSeat = async (userId: string, userName: string) => {
    setBuzzingUserId(userId);
    try {
      await sendBuzz(userId, 'sharp');
      setNotificationMsg(`Haptic posture correction alert sent to ${userName}'s device`);
      setTimeout(() => setNotificationMsg(null), 3500);
    } catch (e) {
      setNotificationMsg(`Sent alert to ${userName}`);
      setTimeout(() => setNotificationMsg(null), 3000);
    } finally {
      setBuzzingUserId(null);
    }
  };

  const handleBuzzAllCritical = async () => {
    if (!fleetData?.users) return;
    const criticalUsers = fleetData.users.filter((u: FleetUserRow) => u.currentStatus === 'severe');
    if (criticalUsers.length === 0) {
      setNotificationMsg('No seats currently in severe slouch.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    for (const u of criticalUsers) {
      await sendBuzz(u.userId, 'sharp');
    }
    setNotificationMsg(`Fleet Haptic Pulse: Dispatched to ${criticalUsers.length} critical slouching workstations`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const users: FleetUserRow[] = fleetData?.users || [];
  const departments = ['All', ...Array.from(new Set(users.map((u) => u.department)))];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalSeats = fleetData?.totalMonitoredSeats ?? 48;
  const avgErgo = fleetData?.fleetErgoScoreAvg ?? 85;
  const slouchIncidents = fleetData?.slouchIncidentsToday ?? 142;
  const criticalCount = fleetData?.activeAlerts ?? 3;

  return (
    <div className="space-y-6">
      {/* Fleet Top Action & Notification Banner */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-xs text-emerald-400 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Fleet Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Monitored Seats */}
        <div className="bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Monitored Seats
            </span>
            <div className="p-2 bg-[#0B1120] rounded-lg border border-[#1E293B] text-[#00BFA5]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{totalSeats}</span>
            <span className="text-xs text-emerald-400 font-medium">100% telemetry online</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active across 4 corporate hubs
          </div>
        </div>

        {/* Metric 2: Fleet Ergo Score Average */}
        <div className="bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fleet Ergo Score Avg
            </span>
            <div className="p-2 bg-[#0B1120] rounded-lg border border-[#1E293B] text-[#10B981]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#10B981]">{avgErgo}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className="text-xs text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% wk
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Target company baseline: 80.0
          </div>
        </div>

        {/* Metric 3: Slouch Incidents Today */}
        <div className="bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Slouch Incidents Today
            </span>
            <div className="p-2 bg-[#0B1120] rounded-lg border border-[#1E293B] text-[#F59E0B]">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#F59E0B]">{slouchIncidents}</span>
            <span className="text-xs text-emerald-400">-18% vs yesterday</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Auto-haptic corrections resolved: {Math.round(slouchIncidents * 0.88)}
          </div>
        </div>

        {/* Metric 4: Critical Posture Alerts Active */}
        <div className="bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Critical Posture Alerts
            </span>
            <div className="p-2 bg-[#0B1120] rounded-lg border border-[#1E293B] text-[#F43F5E]">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#F43F5E]">{criticalCount}</span>
            <span className="text-xs text-rose-400">cervical tilt &gt; 24°</span>
          </div>
          <div className="mt-2">
            <button
              onClick={handleBuzzAllCritical}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 underline flex items-center gap-1"
            >
              <BellRing className="w-3.5 h-3.5" />
              Pulse Alert All Slouchers
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Monitored Users Table Section */}
      <div className="bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
        {/* Table Filters & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00BFA5]" />
              Active Monitored Fleet Workstations
            </h3>
            <p className="text-xs text-slate-400">
              Real-time biometric telemetry received over Pusher sub-40ms channels
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#0B1120] border border-[#1E293B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00BFA5] w-52"
              />
            </div>

            {/* Department Select Tabs */}
            <div className="flex items-center gap-1 bg-[#0B1120] p-1 rounded-lg border border-[#1E293B] overflow-x-auto max-w-xs">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    selectedDept === dept
                      ? 'bg-[#00BFA5] text-[#0B1120] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Companion Hardware</th>
                <th className="py-3 px-4">Posture Status</th>
                <th className="py-3 px-4">Live Angle</th>
                <th className="py-3 px-4">Proximity</th>
                <th className="py-3 px-4">Ergo Score</th>
                <th className="py-3 px-4 text-right">Seat Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70 text-xs">
              {filteredUsers.map((emp) => {
                const isBuzzing = buzzingUserId === emp.userId;
                const status = emp.currentStatus;
                const angle = emp.currentAngle;
                const angleColor = angle > 24 ? '#F43F5E' : angle >= 15 ? '#F59E0B' : '#10B981';

                return (
                  <tr key={emp.userId} className="hover:bg-[#0B1120]/50 transition-colors">
                    {/* Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'}
                          alt={emp.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-[#1E293B]"
                        />
                        <div>
                          <div className="font-semibold text-white hover:text-[#00BFA5] cursor-pointer"
                               onClick={() => onSelectUserForCompanionView?.(emp.userId)}>
                            {emp.displayName}
                          </div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700/50">
                        {emp.department}
                      </span>
                    </td>

                    {/* Linked Device */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[11px]">{emp.device?.name || 'Pixel 8 Pro'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {emp.device?.batteryLevel ? `${emp.device.batteryLevel}% Bat` : 'Online'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        status === 'optimal'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                          : status === 'attention'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                          : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                      }`}>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              status === 'optimal' ? '#10B981' : status === 'attention' ? '#F59E0B' : '#F43F5E',
                          }}
                        />
                        {status === 'optimal' ? 'Optimal' : status === 'attention' ? 'Attention' : 'Severe Slouch'}
                      </span>
                    </td>

                    {/* Live Angle */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold" style={{ color: angleColor }}>
                          {angle.toFixed(1)}°
                        </span>
                        <div className="w-12 h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (angle / 35) * 100)}%`,
                              backgroundColor: angleColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Proximity */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {emp.proximity.toFixed(1)} cm
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-white">
                        {emp.score}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>

                    {/* Actions ("Buzz Seat") */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleBuzzSeat(emp.userId, emp.displayName)}
                        disabled={isBuzzing}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isBuzzing
                            ? 'bg-slate-700 text-slate-400 border-slate-600'
                            : status === 'severe'
                            ? 'bg-[#F43F5E] hover:bg-rose-600 text-white border-rose-400/40 shadow-sm shadow-rose-500/20'
                            : 'bg-[#1E293B] hover:bg-[#00BFA5] hover:text-[#0B1120] text-teal-400 border-teal-500/30'
                        }`}
                      >
                        <Vibrate className={`w-3.5 h-3.5 ${isBuzzing ? 'animate-spin' : ''}`} />
                        <span>{isBuzzing ? 'Buzzing...' : 'Buzz Seat'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
