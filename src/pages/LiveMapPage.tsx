import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentLeafletMap } from '../components/map/IncidentLeafletMap';
import { Badge } from '../components/common/Badge';
import { Map, List, Filter, ExternalLink, Search, Wifi, WifiOff } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const { incidents, teams, isOnline, navigateToIncidentDetails } = useApp();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const filtered = incidents.filter((inc) => {
    const matchCat = selectedCategory === 'ALL' || inc.category === selectedCategory;
    const matchSev = selectedSeverity === 'ALL' || inc.severity === selectedSeverity;
    const matchSt = selectedStatus === 'ALL' || inc.status === selectedStatus;
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      [inc.id, inc.title, inc.category, inc.description, inc.location.address]
        .some((value) => value.toLowerCase().includes(query));
    return matchCat && matchSev && matchSt && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header & Map/List View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Geographic Emergency Map
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO DATA
            </span>
            <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${
              isOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'Online' : 'Offline · local data'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Leaflet & OpenStreetMap integration showing roads, place names, and mapped rail lines where available in OSM data.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map + Queue View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Coordinate Table View</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search incidents"
              aria-label="Search incidents"
              className="w-44 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 font-medium text-slate-700"
            />
          </label>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Map Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter map by incident category"
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-medium bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="Flood">Flood</option>
            <option value="Urban Fire">Urban Fire</option>
            <option value="Structural Collapse">Structural Collapse</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Landslide">Landslide</option>
            <option value="Road Accident">Road Accident</option>
            <option value="Chemical Hazard">Chemical Hazard</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            aria-label="Filter map by severity"
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-medium bg-white text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter map by status"
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-medium bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="font-medium text-slate-600">
          Showing <span className="font-mono tabular-nums font-bold text-slate-900">{filtered.length}</span> plotted incidents
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Incident Pin Selector */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-3 max-h-[580px] overflow-y-auto space-y-2">
            <h2 className="font-bold text-slate-900 text-xs px-1 pb-1 border-b border-slate-100">
              Incident Markers ({filtered.length})
            </h2>
            {filtered.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedId(inc.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition space-y-1.5 ${
                  selectedId === inc.id
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono tabular-nums font-bold text-slate-900">{inc.id}</span>
                  <Badge label={inc.severity} variant="severity" />
                </div>
                <div className="font-bold text-slate-800 line-clamp-1">{inc.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{inc.location.address}</div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="font-mono tabular-nums text-slate-500">
                    {inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToIncidentDetails(inc.id);
                    }}
                    className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>Manage</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Leaflet Map */}
          <div className="lg:col-span-3">
            <IncidentLeafletMap
              incidents={filtered}
              teams={teams}
              selectedIncidentId={selectedId}
              onSelectIncident={setSelectedId}
              heightClass="h-[450px] sm:h-[600px]"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">{inc.id}</td>
                    <td className="py-3 px-4 font-semibold">{inc.category}</td>
                    <td className="py-3 px-4 text-slate-800">{inc.title}</td>
                    <td className="py-3 px-4 text-slate-600">{inc.location.address}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {inc.location.latitude.toFixed(5)}, {inc.location.longitude.toFixed(5)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={inc.severity} variant="severity" />
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={inc.status} variant="status" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigateToIncidentDetails(inc.id)}
                        className="px-3 py-1 bg-slate-900 text-white rounded font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
