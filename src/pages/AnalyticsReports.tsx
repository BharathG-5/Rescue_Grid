import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Download, Printer, Info } from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const { incidents, resources, volunteers } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d'>('all');

  const filteredIncidents = useMemo(() => {
    const now = Date.now();
    return incidents.filter((inc) => {
      const matchCat = categoryFilter === 'ALL' || inc.category === categoryFilter;
      const ageHours = (now - new Date(inc.reportedAt).getTime()) / (1000 * 3600);
      const matchDate =
        dateRange === 'all' || (dateRange === '24h' ? ageHours <= 24 : ageHours <= 168);
      return matchCat && matchDate;
    });
  }, [incidents, categoryFilter, dateRange]);

  // Export CSV for incidents or resources
  const handleExportCSV = (dataset: 'incidents' | 'resources') => {
    if (dataset === 'incidents') {
      const headers = [
        'ID,Category,Title,Severity,Verification,Status,Latitude,Longitude,Address,PeopleAffected,Injuries,ReportedAt'
      ];
      const rows = filteredIncidents.map((i) =>
        [
          i.id,
          `"${i.category}"`,
          `"${i.title.replace(/"/g, '""')}"`,
          i.severity,
          i.verification,
          i.status,
          i.location.latitude,
          i.location.longitude,
          `"${i.location.address.replace(/"/g, '""')}"`,
          i.peopleAffected,
          i.injuriesReported,
          i.reportedAt
        ].join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `rescuegrid_incidents_demo_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['ID,Name,Category,AvailableQty,RequiredQty,Unit,StorageLocation,ResponsibleTeam'];
      const rows = resources.map((r) =>
        [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.category}"`,
          r.availableQty,
          r.requiredQty,
          r.unit,
          `"${r.storageLocation}"`,
          `"${r.responsibleTeam}"`
        ].join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `rescuegrid_resources_demo_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Severity Breakdown
  const severityCounts = [
    { severity: 'Critical', count: filteredIncidents.filter((i) => i.severity === 'Critical').length, fill: '#DC2626' },
    { severity: 'High', count: filteredIncidents.filter((i) => i.severity === 'High').length, fill: '#D97706' },
    { severity: 'Medium', count: filteredIncidents.filter((i) => i.severity === 'Medium').length, fill: '#CA8A04' },
    { severity: 'Low', count: filteredIncidents.filter((i) => i.severity === 'Low').length, fill: '#2563EB' }
  ];

  // Status Breakdown
  const statusCounts = [
    { status: 'New', count: filteredIncidents.filter((i) => i.status === 'New').length, fill: '#0284C7' },
    { status: 'Pending Review', count: filteredIncidents.filter((i) => i.status === 'Pending Review').length, fill: '#7C3AED' },
    { status: 'Assigned', count: filteredIncidents.filter((i) => i.status === 'Assigned').length, fill: '#4F46E5' },
    { status: 'In Progress', count: filteredIncidents.filter((i) => i.status === 'In Progress').length, fill: '#2563EB' },
    { status: 'Resolved', count: filteredIncidents.filter((i) => i.status === 'Resolved').length, fill: '#059669' }
  ];

  // Unresolved Incidents by Age
  const unresolvedByAge = useMemo(() => {
    const unresolved = filteredIncidents.filter((i) => i.status !== 'Resolved');
    const now = Date.now();
    return [
      {
        bracket: '< 30 mins',
        count: unresolved.filter((i) => (now - new Date(i.reportedAt).getTime()) / 60000 < 30).length
      },
      {
        bracket: '30–90 mins',
        count: unresolved.filter((i) => {
          const m = (now - new Date(i.reportedAt).getTime()) / 60000;
          return m >= 30 && m <= 90;
        }).length
      },
      {
        bracket: '> 90 mins',
        count: unresolved.filter((i) => (now - new Date(i.reportedAt).getTime()) / 60000 > 90).length
      }
    ];
  }, [filteredIncidents]);

  // Average Response Time (only where reliable audit trail timestamps exist)
  const responseTimeStats = useMemo(() => {
    const diffs: number[] = [];
    filteredIncidents.forEach((inc) => {
      const assignLog = inc.auditTrail.find((a) => a.action.toLowerCase().includes('assigned'));
      if (assignLog) {
        const diffMin = Math.round(
          (new Date(assignLog.timestamp).getTime() - new Date(inc.reportedAt).getTime()) / 60000
        );
        if (diffMin >= 0) diffs.push(diffMin);
      }
    });
    if (diffs.length === 0) return null;
    const avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    return { avgMinutes: avg, sampleSize: diffs.length };
  }, [filteredIncidents]);

  const COLORS = ['#2563EB', '#DC2626', '#D97706', '#059669', '#7C3AED', '#0891B2'];

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredIncidents.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredIncidents]);

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Analytics & Operational Reports
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            All statistics are computed directly from the active IndexedDB records. No fabricated AI predictions or external telemetry are shown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('incidents')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Incidents CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('resources')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Inventory CSV</span>
          </button>
        </div>
      </div>

      {/* Data Provenance & Honesty Banner */}
      <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Data Provenance Distinction:</strong> Metrics below reflect <strong>Sample Demo Data</strong> combined with <strong>User-Entered Local Reports</strong>.Verified counts reflect coordinator workflow decisions (<span className="font-mono">{filteredIncidents.filter((i) => i.verification === 'Verified').length}</span> verified vs. <span className="font-mono">{filteredIncidents.filter((i) => i.verification !== 'Verified').length}</span> pending/unverified).
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-700">Filter Dataset:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter analytics by category"
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-medium bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Flood">Flood</option>
            <option value="Urban Fire">Urban Fire</option>
            <option value="Structural Collapse">Structural Collapse</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Landslide">Landslide</option>
            <option value="Road Accident">Road Accident</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'all' | '24h' | '7d')}
            aria-label="Filter analytics by date range"
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-medium bg-white"
          >
            <option value="all">All Recorded Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <div className="text-slate-600">
          Analyzing <strong className="font-mono tabular-nums text-slate-900">{filteredIncidents.length}</strong> incident records
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Avg. Time to Team Assignment</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
            {responseTimeStats ? `${responseTimeStats.avgMinutes} mins` : 'N/A'}
          </div>
          <span className="text-[11px] text-slate-500">
            {responseTimeStats
              ? `Computed from ${responseTimeStats.sampleSize} timestamped audit logs (DEMO)`
              : 'Requires assignment audit timestamps'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Total People Affected</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
            {filteredIncidents.reduce((acc, i) => acc + i.peopleAffected, 0)}
          </div>
          <span className="text-[11px] text-slate-500">Reported across filtered incidents</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Volunteer Deployment Ratio</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-blue-700 mt-1">
            {Math.round(
              (volunteers.filter((v) => v.availability === 'Deployed').length /
                Math.max(1, volunteers.length)) *
                100
            )}
            %
          </div>
          <span className="text-[11px] text-slate-500">
            {volunteers.filter((v) => v.availability === 'Deployed').length} of {volunteers.length} volunteers deployed
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Overall Resource Fulfilment</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1">
            {Math.round(
              resources.reduce((acc, r) => acc + Math.min(1, r.availableQty / Math.max(1, r.requiredQty)), 0) /
                Math.max(1, resources.length) *
                100
            )}
            %
          </div>
          <span className="text-[11px] text-slate-500">Mean fulfilment across {resources.length} categories</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents by Severity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm mb-1">Incidents by Severity (DEMO DATA)</h2>
          <p className="text-xs text-slate-500 mb-4">Assessed urgency levels</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityCounts}>
                <XAxis dataKey="severity" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {severityCounts.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm mb-1">Incident Workflow Status Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">Current stage in the coordination pipeline</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts}>
                <XAxis dataKey="status" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {statusCounts.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unresolved Incidents by Age */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm mb-1">Unresolved Incidents by Elapsed Age</h2>
          <p className="text-xs text-slate-500 mb-4">Duration since initial report timestamp</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unresolvedByAge}>
                <XAxis dataKey="bracket" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Unresolved Incidents" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-sm mb-1">Incidents by Emergency Category</h2>
          <p className="text-xs text-slate-500 mb-4">Proportional category distribution</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
