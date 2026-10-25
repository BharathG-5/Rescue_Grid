import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import {
  AlertTriangle,
  Flame,
  UserX,
  Activity,
  Users,
  Radio,
  Box,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldAlert,
  FilePlus2,
  Map
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

function formatElapsedDuration(isoTimestamp: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(isoTimestamp).getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  if (totalMinutes < 1) return 'Just now';
  if (totalMinutes < 60) return `${totalMinutes}m unresolved`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m unresolved`;
}

export const OverviewDashboard: React.FC = () => {
  const {
    incidents,
    teams,
    volunteers,
    resources,
    resourceRequests,
    notifications,
    setCurrentPage,
    navigateToIncidentDetails
  } = useApp();

  const [trendRange, setTrendRange] = useState<'6h' | '24h' | '7d'>('24h');

  // 8 Required Summary Card Metrics (Derived from live store)
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const unassignedIncidents = incidents.filter((i) => !i.assignedTeamId && i.status !== 'Resolved').length;
  const inProgressIncidents = incidents.filter((i) => i.status === 'In Progress').length;
  const availableVolunteers = volunteers.filter((v) => v.availability === 'Available').length;
  const activeTeams = teams.filter((t) => t.status === 'Deployed').length;
  const pendingResourceRequests = resourceRequests.filter((r) => r.status === 'Pending').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved').length;

  const summaryCards = [
    {
      label: 'Total Reported Incidents',
      value: totalIncidents,
      desc: 'All logged incidents in store',
      trend: `${incidents.filter((i) => i.verification === 'Verified').length} verified by coordinators`,
      icon: AlertTriangle,
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Critical Incidents',
      value: criticalIncidents,
      desc: 'Unresolved life-safety threats',
      trend: criticalIncidents > 0 ? 'Immediate triage required' : 'No active criticals',
      icon: Flame,
      iconColor: 'text-red-600 bg-red-50'
    },
    {
      label: 'Unassigned Incidents',
      value: unassignedIncidents,
      desc: 'Awaiting rescue team dispatch',
      trend: `${teams.filter((t) => t.status === 'Available').length} teams available to assign`,
      icon: UserX,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      label: 'Incidents In Progress',
      value: inProgressIncidents,
      desc: 'Active field operations',
      trend: `${incidents.filter((i) => i.status === 'Assigned').length} additional units en route`,
      icon: Activity,
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Available Volunteers',
      value: availableVolunteers,
      desc: `Out of ${volunteers.length} registered volunteers`,
      trend: `${volunteers.filter((v) => v.availability === 'Deployed').length} currently deployed`,
      icon: Users,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      label: 'Active Rescue Teams',
      value: activeTeams,
      desc: `Out of ${teams.length} specialized taskforces`,
      trend: `${teams.filter((t) => t.status === 'Available').length} on standby`,
      icon: Radio,
      iconColor: 'text-indigo-600 bg-indigo-50'
    },
    {
      label: 'Pending Resource Requests',
      value: pendingResourceRequests,
      desc: 'Unfulfilled field requisitions',
      trend: `${resourceRequests.filter((r) => r.status === 'Fulfilled').length} fulfilled requests`,
      icon: Box,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      label: 'Resolved Incidents',
      value: resolvedIncidents,
      desc: 'Closed & stabilized operations',
      trend: `${Math.round((resolvedIncidents / Math.max(1, totalIncidents)) * 100)}% resolution rate`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50'
    }
  ];

  // A. Incident Trend Chart (derived from incidents timestamps across windows)
  const trendData = useMemo(() => {
    const now = Date.now();
    const windowHours = trendRange === '6h' ? 6 : trendRange === '24h' ? 24 : 168;
    const buckets = [
      { label: `-${windowHours}h`, cutoff: now - windowHours * 3600 * 1000 },
      { label: `-${Math.round(windowHours * 0.66)}h`, cutoff: now - windowHours * 0.66 * 3600 * 1000 },
      { label: `-${Math.round(windowHours * 0.33)}h`, cutoff: now - windowHours * 0.33 * 3600 * 1000 },
      { label: 'Now', cutoff: now + 1000 }
    ];

    return buckets.map((b) => {
      const upToBucket = incidents.filter((i) => new Date(i.reportedAt).getTime() <= b.cutoff);
      return {
        window: b.label,
        Active: upToBucket.filter((i) => i.status !== 'Resolved').length,
        InProgress: upToBucket.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length,
        Resolved: upToBucket.filter((i) => i.status === 'Resolved').length
      };
    });
  }, [incidents, trendRange]);

  // B. Emergency Category Donut Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((inc) => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const CATEGORY_COLORS = ['#2563EB', '#DC2626', '#D97706', '#059669', '#7C3AED', '#0891B2', '#DB2777', '#475569'];

  // C. Incident Priority Chart
  const priorityData = useMemo(
    () => [
      { priority: 'Critical', count: incidents.filter((i) => i.severity === 'Critical').length, fill: '#DC2626' },
      { priority: 'High', count: incidents.filter((i) => i.severity === 'High').length, fill: '#D97706' },
      { priority: 'Medium', count: incidents.filter((i) => i.severity === 'Medium').length, fill: '#CA8A04' },
      { priority: 'Low', count: incidents.filter((i) => i.severity === 'Low').length, fill: '#2563EB' }
    ],
    [incidents]
  );

  // D. Volunteer Availability Chart
  const volunteerChartData = useMemo(
    () => [
      { status: 'Available', count: volunteers.filter((v) => v.availability === 'Available').length, fill: '#059669' },
      { status: 'Deployed', count: volunteers.filter((v) => v.availability === 'Deployed').length, fill: '#2563EB' },
      { status: 'Unavailable', count: volunteers.filter((v) => v.availability === 'Unavailable').length, fill: '#D97706' },
      { status: 'Off Duty', count: volunteers.filter((v) => v.availability === 'Off Duty').length, fill: '#64748B' }
    ],
    [volunteers]
  );

  // E. Resource Availability Chart
  const resourceChartData = useMemo(
    () =>
      resources.slice(0, 6).map((r) => ({
        name: r.category.replace(' Equipment', '').replace('Temporary ', ''),
        FulfilmentPct: Math.min(100, Math.round((r.availableQty / Math.max(1, r.requiredQty)) * 100)),
        Available: r.availableQty,
        Required: r.requiredQty
      })),
    [resources]
  );

  // G. Critical Incident Panel (unresolved critical/high incidents)
  const unresolvedUrgent = useMemo(
    () =>
      incidents
        .filter((i) => (i.severity === 'Critical' || i.severity === 'High') && i.status !== 'Resolved')
        .sort((a, b) => (a.severity === 'Critical' && b.severity !== 'Critical' ? -1 : 1)),
    [incidents]
  );

  // H. Combined Activity Feed
  const activityFeed = useMemo(() => {
    const auditItems = incidents.flatMap((inc) =>
      inc.auditTrail.map((log) => ({
        id: `${inc.id}-${log.id}`,
        timestamp: log.timestamp,
        title: `${inc.id} · ${log.actor}`,
        detail: log.action,
        incidentId: inc.id
      }))
    );
    const notifItems = notifications.map((n) => ({
      id: n.id,
      timestamp: n.timestamp,
      title: n.title,
      detail: n.message,
      incidentId: n.linkId
    }));
    return [...auditItems, ...notifItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [incidents, notifications]);

  return (
    <div className="space-y-6">
      {/* Header & DEMO DATA Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Overview Command Dashboard
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            All metrics, charts, and tables below derive live from the local IndexedDB emergency store.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage('map')}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-3.5 py-2 rounded-lg text-xs transition whitespace-nowrap shrink-0"
          >
            <Map className="w-4 h-4 text-blue-600" />
            <span>Live Map</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('report')}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm text-xs transition whitespace-nowrap shrink-0"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Report Emergency</span>
          </button>
        </div>
      </div>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">{card.label}</span>
                <div className={`p-2 rounded-lg shrink-0 ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2.5">
                <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {card.value}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{card.desc}</div>
              </div>
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 1 Charts: A. Incident Trend Chart & B. Emergency Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Incident Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Incident Trend Over Time (DEMO DATA)
              </h2>
              <p className="text-xs text-slate-500">
                Cumulative active, in-progress, and resolved incident series
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
              {(['6h', '24h', '7d'] as const).map((range) => (
                <button
                  type="button"
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    trendRange === range
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="window" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="Active"
                  name="Unresolved Active"
                  stroke="#DC2626"
                  fill="#FEE2E2"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="InProgress"
                  name="Assigned / In Progress"
                  stroke="#2563EB"
                  fill="#DBEAFE"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Resolved"
                  name="Resolved"
                  stroke="#059669"
                  fill="#D1FAE5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Emergency Category Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Emergency Category Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution by incident classification</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-3 text-xs">
            {categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between gap-1 text-[11px]">
                <span className="flex items-center gap-1.5 truncate text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono tabular-nums font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: C. Incident Priority, D. Volunteer Availability, E. Resource Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Incident Priority Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm">Incident Priority Distribution</h2>
          <p className="text-xs text-slate-500 mb-3">Critical, High, Medium, and Low severity counts</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="priority" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* D. Volunteer Availability Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm">Volunteer Availability Status</h2>
          <p className="text-xs text-slate-500 mb-3">Available, Deployed, Unavailable, and Off Duty</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volunteerChartData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="status" stroke="#64748B" fontSize={11} width={78} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" name="Volunteers" radius={[0, 4, 4, 0]}>
                  {volunteerChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E. Resource Availability Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm">Resource Fulfilment Rate (%)</h2>
          <p className="text-xs text-slate-500 mb-3">Available stock vs. target requirement</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceChartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="FulfilmentPct" name="Fulfilment %" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* G. Critical Incident Panel & H. Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* G. Critical & Urgent Incident Panel */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Critical & High-Priority Unresolved Panel
                  </h2>
                  <p className="text-xs text-slate-500">
                    Elapsed time since initial report and direct coordinator dispatch link
                  </p>
                </div>
              </div>
              <span className="font-mono tabular-nums text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                {unresolvedUrgent.length} Unresolved
              </span>
            </div>

            {unresolvedUrgent.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                All critical and high-priority incidents have been resolved.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {unresolvedUrgent.map((inc) => (
                  <div
                    key={inc.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-900">{inc.id}</span>
                        <Badge label={inc.severity} variant="severity" />
                        <Badge label={inc.status} variant="status" />
                        <span className="text-slate-400">·</span>
                        <span className="font-mono tabular-nums text-red-700 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatElapsedDuration(inc.reportedAt)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm truncate">{inc.title}</h3>
                      <p className="text-xs text-slate-600 truncate">
                        {inc.location.address} · Verification: {inc.verification} · Team:{' '}
                        {inc.assignedTeamName || 'Unassigned'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToIncidentDetails(inc.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center whitespace-nowrap shrink-0"
                    >
                      <span>Incident Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* H. Activity Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Operational Activity Feed</h2>
              <button
                type="button"
                onClick={() => setCurrentPage('notifications')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                All Alerts
              </button>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-1">
              {activityFeed.map((item) => (
                <div key={item.id} className="py-2.5 text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800 truncate">{item.title}</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug">{item.detail}</p>
                  {item.incidentId && (
                    <button
                      type="button"
                      onClick={() => navigateToIncidentDetails(item.incidentId!)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Inspect {item.incidentId}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* F. Recent Incident Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Recent Incident Reports</h2>
            <p className="text-xs text-slate-500">
              Synchronized with Incident Management, Map, and Analytics
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage('incidents')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Open Full Incident Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Reported Time</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.slice(0, 7).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {inc.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {inc.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                    {inc.location.address}
                  </td>
                  <td className="py-3 px-4">
                    <Badge label={inc.severity} variant="severity" />
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {new Date(inc.reportedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-[180px] truncate">
                    {inc.assignedTeamName || <span className="text-slate-400">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4">
                    <Badge label={inc.status} variant="status" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigateToIncidentDetails(inc.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs transition whitespace-nowrap shrink-0"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
