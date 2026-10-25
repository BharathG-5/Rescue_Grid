import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Incident,
  IncidentStatus,
  SeverityLevel,
  VerificationState,
  IncidentCategory
} from '../types';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Search,
  LayoutGrid,
  List,
  Radio,
  Users,
  Edit3,
  MessageSquarePlus,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export const IncidentManagement: React.FC = () => {
  const {
    incidents,
    teams,
    volunteers,
    updateIncidentFields,
    updateIncidentStatus,
    updateIncidentVerification,
    addIncidentInternalNote,
    assignTeamToIncident,
    assignVolunteerToIncident,
    selectedIncidentIdForView,
    setSelectedIncidentIdForView,
    globalSearch
  } = useApp();

  const [selectedId, setSelectedId] = useState<string | null>(selectedIncidentIdForView);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterVerification, setFilterVerification] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  // Detail modal interactive states
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSeverity, setEditSeverity] = useState<SeverityLevel>('High');
  const [editCategory, setEditCategory] = useState<IncidentCategory>('Flood');
  const [editAddress, setEditAddress] = useState('');
  const [editPeople, setEditPeople] = useState<number>(0);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [confirmTeamOpen, setConfirmTeamOpen] = useState<boolean>(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [statusNoteInput, setStatusNoteInput] = useState<string>('');

  useEffect(() => {
    if (selectedIncidentIdForView) {
      setSelectedId(selectedIncidentIdForView);
      setSelectedIncidentIdForView(null);
    }
  }, [selectedIncidentIdForView, setSelectedIncidentIdForView]);

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedId) || null,
    [incidents, selectedId]
  );

  useEffect(() => {
    if (selectedIncident) {
      setEditTitle(selectedIncident.title);
      setEditDesc(selectedIncident.description);
      setEditSeverity(selectedIncident.severity);
      setEditCategory(selectedIncident.category);
      setEditAddress(selectedIncident.location.address);
      setEditPeople(selectedIncident.peopleAffected);
      setSelectedTeamId(selectedIncident.assignedTeamId || (teams[0]?.id ?? ''));
    }
  }, [selectedIncident, teams]);

  const activeSearch = localSearch || globalSearch;

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        const matchesSearch =
          !activeSearch ||
          inc.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
          inc.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
          inc.description.toLowerCase().includes(activeSearch.toLowerCase()) ||
          inc.category.toLowerCase().includes(activeSearch.toLowerCase()) ||
          inc.location.address.toLowerCase().includes(activeSearch.toLowerCase());

        const matchesCategory = filterCategory === 'ALL' || inc.category === filterCategory;
        const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
        const matchesVerification = filterVerification === 'ALL' || inc.verification === filterVerification;
        const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSeverity &&
          matchesVerification &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
        }
        const diff = new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        return sortBy === 'newest' ? diff : -diff;
      });
  }, [
    incidents,
    activeSearch,
    filterCategory,
    filterSeverity,
    filterVerification,
    filterStatus,
    sortBy
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / pageSize));
  const currentPageIndex = Math.min(page, totalPages);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPageIndex - 1) * pageSize,
    currentPageIndex * pageSize
  );

  const selectedTeamForDialog = teams.find((t) => t.id === selectedTeamId);

  const handleSaveFieldEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    await updateIncidentFields(selectedIncident.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      severity: editSeverity,
      category: editCategory,
      address: editAddress.trim(),
      peopleAffected: Number(editPeople) || 0
    });
    setIsEditingFields(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !noteInput.trim()) return;
    await addIncidentInternalNote(selectedIncident.id, noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Incident Management & Triage
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Coordinator workflow: <strong>New → Pending Review → Verified / Unverified → Assigned → In Progress → Resolved</strong>. Severity is independent from verification state.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Search, Filters & Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Incident ID, description, category, or address..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
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
            value={filterSeverity}
            onChange={(e) => {
              setFilterSeverity(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by severity"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterVerification}
            onChange={(e) => {
              setFilterVerification(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by verification state"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Verification</option>
            <option value="Pending">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by workflow status"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'severity')}
            aria-label="Sort incidents"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="severity">Sort: Highest Severity</option>
          </select>
        </div>
      </div>

      {/* List or Grid View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Rescue Team</th>
                  <th className="py-3 px-4">Volunteers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-500">
                      No emergency incidents match your current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                        <div>{inc.id}</div>
                        <div className="text-[10px] font-normal text-slate-500">{inc.syncStatus}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {inc.category}
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900 truncate">{inc.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{inc.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={inc.severity} variant="severity" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate">
                        {inc.location.address}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {new Date(inc.reportedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={inc.verification} variant="verification" />
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate">
                        {inc.assignedTeamName ? (
                          <span className="font-semibold text-slate-800">{inc.assignedTeamName}</span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {inc.assignedVolunteerIds.length} assigned
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={inc.status} variant="status" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(inc.id);
                            setIsEditingFields(false);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition whitespace-nowrap shrink-0"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedIncidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono tabular-nums font-bold text-xs text-slate-900">
                    {inc.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge label={inc.severity} variant="severity" />
                    <Badge label={inc.status} variant="status" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{inc.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{inc.description}</p>
                <div className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{inc.location.address}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Verification: <strong>{inc.verification}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(inc.id);
                    setIsEditingFields(false);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs"
                >
                  Manage Incident
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200">
        <div>
          Showing <span className="font-mono tabular-nums font-bold">{paginatedIncidents.length}</span> of{' '}
          <span className="font-mono tabular-nums font-bold">{filteredIncidents.length}</span> matching incidents
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPageIndex <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono tabular-nums font-semibold">
            Page {currentPageIndex} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPageIndex >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incident Detail & Coordinator Management Modal */}
      {selectedIncident && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono tabular-nums font-extrabold text-slate-900 text-sm">
                  {selectedIncident.id}
                </span>
                <Badge label={selectedIncident.severity} variant="severity" />
                <Badge label={`Verification: ${selectedIncident.verification}`} variant="verification" />
                <Badge label={selectedIncident.status} variant="status" />
                <span className="text-xs text-slate-500 font-mono">
                  ({selectedIncident.syncStatus})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingFields(!isEditingFields)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingFields ? 'Cancel Edit' : 'Edit Fields'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  aria-label="Close detail view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {isEditingFields ? (
                <form onSubmit={handleSaveFieldEdits} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Edit Permitted Incident Fields</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Headline</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as IncidentCategory)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Flood">Flood</option>
                        <option value="Urban Fire">Urban Fire</option>
                        <option value="Structural Collapse">Structural Collapse</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Missing Person">Missing Person</option>
                        <option value="Landslide">Landslide</option>
                        <option value="Road Accident">Road Accident</option>
                        <option value="Chemical Hazard">Chemical Hazard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                      <select
                        value={editSeverity}
                        onChange={(e) => setEditSeverity(e.target.value as SeverityLevel)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Location Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">People Affected</label>
                      <input
                        type="number"
                        min="0"
                        value={editPeople}
                        onChange={(e) => setEditPeople(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingFields(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                    >
                      Save Field Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{selectedIncident.title}</h2>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedIncident.description}</p>
                </div>
              )}

              {/* Key Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Address</span>
                  <span className="font-semibold text-slate-900">{selectedIncident.location.address}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Coordinates</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {selectedIncident.location.latitude.toFixed(4)}, {selectedIncident.location.longitude.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Affected / Injuries</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {selectedIncident.peopleAffected} ppl · {selectedIncident.injuriesReported} injured
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Reporter Contact</span>
                  <span className="font-semibold text-slate-900">
                    {selectedIncident.contactName || 'Anonymous'} {selectedIncident.contactPhone ? `(${selectedIncident.contactPhone})` : ''}
                  </span>
                </div>
              </div>

              {/* Separate Verification Control */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Coordinator Verification Decision</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verification is tracked independently from reported severity.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['Pending', 'Verified', 'Unverified'] as VerificationState[]).map((vState) => (
                      <button
                        type="button"
                        key={vState}
                        onClick={() => updateIncidentVerification(selectedIncident.id, vState)}
                        className={`px-3 py-1.5 rounded-lg font-semibold border transition whitespace-nowrap shrink-0 ${
                          selectedIncident.verification === vState
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Mark {vState}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow Status Pipeline */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Incident Workflow Progression
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    New → Pending Review → Verified / Unverified → Assigned → In Progress → Resolved
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'New',
                      'Pending Review',
                      'Verified',
                      'Unverified',
                      'Assigned',
                      'In Progress',
                      'Resolved'
                    ] as IncidentStatus[]
                  ).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => updateIncidentStatus(selectedIncident.id, st, statusNoteInput)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition whitespace-nowrap shrink-0 ${
                        selectedIncident.status === st
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={statusNoteInput}
                  onChange={(e) => setStatusNoteInput(e.target.value)}
                  placeholder="Optional transition note for audit log before clicking status above..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                />
              </div>

              {/* Rescue Team & Volunteer Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-blue-600" />
                      <span>Assign DEMO Rescue Team</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Current: <strong>{selectedIncident.assignedTeamName || 'Unassigned'}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      aria-label="Select rescue team"
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    >
                      {teams.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} ({tm.status} · {tm.membersCount} members)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setConfirmTeamOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                    >
                      Assign Team
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Assign DEMO Volunteers</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assigned ({selectedIncident.assignedVolunteerIds.length}):{' '}
                    {selectedIncident.assignedVolunteerIds
                      .map((vid) => volunteers.find((v) => v.id === vid)?.name || vid)
                      .join(', ') || 'None'}
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVolunteerId}
                      onChange={(e) => setSelectedVolunteerId(e.target.value)}
                      aria-label="Select volunteer"
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    >
                      <option value="">Select volunteer...</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.availability} · {v.skills[0]})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedVolunteerId}
                      onClick={() => {
                        if (selectedVolunteerId) {
                          assignVolunteerToIncident(selectedIncident.id, selectedVolunteerId);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Internal Coordinator Notes */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-slate-700" />
                  <span>Internal Coordinator Notes</span>
                </h3>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal operational note..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                  >
                    Add Note
                  </button>
                </form>
                {selectedIncident.internalNotes && selectedIncident.internalNotes.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {selectedIncident.internalNotes.map((n, idx) => (
                      <li key={idx} className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-slate-700">
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Status & Assignment Audit Trail */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">
                  Audit Trail of Status & Assignment Changes
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedIncident.auditTrail.map((log) => (
                    <div key={log.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-semibold text-slate-900">{log.action}</span>
                        <span className="text-slate-500 ml-2">by {log.actor}</span>
                      </div>
                      <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Assignment Confirmation Modal with Selected Team Details */}
      <ConfirmModal
        isOpen={confirmTeamOpen}
        title="Confirm DEMO Rescue Team Assignment"
        message={`Assign ${selectedTeamForDialog?.name || 'selected unit'} to incident ${selectedIncident?.id}? Note: In frontend demo mode, this assignment is persisted locally in IndexedDB and does not contact a live rescue team.`}
        details={
          selectedTeamForDialog && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><strong>Unit:</strong> {selectedTeamForDialog.name} ({selectedTeamForDialog.id})</div>
              <div><strong>Specialty:</strong> {selectedTeamForDialog.type} · {selectedTeamForDialog.membersCount} Members</div>
              <div><strong>Capabilities:</strong> {selectedTeamForDialog.capabilities.join(', ')}</div>
              <div><strong>Service Area:</strong> {selectedTeamForDialog.serviceArea}</div>
            </div>
          )
        }
        confirmLabel="Confirm DEMO Assignment"
        variant="primary"
        onConfirm={async () => {
          if (selectedIncident && selectedTeamId) {
            await assignTeamToIncident(selectedIncident.id, selectedTeamId);
            setConfirmTeamOpen(false);
          }
        }}
        onCancel={() => setConfirmTeamOpen(false)}
      />
    </div>
  );
};
