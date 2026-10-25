import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DraftReport } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Badge } from '../components/common/Badge';
import {
  FileEdit,
  Trash2,
  Copy,
  Send,
  Search,
  Clock,
  MapPin,
  Edit3,
  Plus
} from 'lucide-react';

function calculateCompletionStatus(draft: DraftReport): { percent: number; label: string } {
  let filled = 0;
  const total = 5;
  if (draft.category) filled++;
  if (draft.title && draft.title.trim().length > 2) filled++;
  if (draft.description && draft.description.trim().length > 5) filled++;
  if (typeof draft.latitude === 'number' && typeof draft.longitude === 'number') filled++;
  if (draft.address && draft.address.trim().length > 2) filled++;
  const percent = Math.round((filled / total) * 100);
  const label = percent === 100 ? 'Ready to Submit' : percent >= 60 ? 'Mostly Complete' : 'Needs Details';
  return { percent, label };
}

export const DraftReports: React.FC = () => {
  const {
    drafts,
    deleteDraft,
    duplicateDraft,
    addIncident,
    setEditingDraft,
    setCurrentPage,
    showToast
  } = useApp();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredDrafts = drafts
    .filter((d) => {
      const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
      const matchesSearch =
        !search ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        (d.title && d.title.toLowerCase().includes(search.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(search.toLowerCase())) ||
        (d.address && d.address.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const diff = new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
      return sortOrder === 'newest' ? diff : -diff;
    });

  const handleContinueEditing = (draft: DraftReport) => {
    setEditingDraft(draft);
    setCurrentPage('report');
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteDraft(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleSubmitDraftAsEmergency = async (draft: DraftReport) => {
    if (!draft.title || !draft.title.trim()) {
      showToast('Please click Continue Editing to add a title before submitting.', 'error');
      return;
    }
    const latitude = draft.latitude;
    const longitude = draft.longitude;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setEditingDraft(draft);
      setCurrentPage('report');
      showToast('Select a valid emergency location before submitting this draft.', 'warning');
      return;
    }

    await addIncident(
      {
        category: draft.category || 'Flood',
        title: draft.title.trim(),
        description: draft.description?.trim() || 'Submitted from saved local draft.',
        severity: draft.severity || 'Medium',
        verification: 'Pending',
        status: 'New',
        location: {
          address: draft.address || `Selected Coordinates (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
          latitude,
          longitude,
          accuracyMeters: draft.accuracyMeters,
          details: draft.additionalLocation
        },
        peopleAffected: draft.peopleAffected ?? 0,
        injuriesReported: draft.injuriesReported ?? 0,
        requiresMedical: draft.requiresMedical ?? false,
        contactName: draft.contactName,
        contactPhone: draft.contactPhone,
        photoDataUrl: draft.photoDataUrl,
        assignedVolunteerIds: []
      },
      draft.id
    );

    setCurrentPage('incidents');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Draft Emergency Reports
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Locally persisted drafts in IndexedDB. Deleting a draft removes only the local draft and never deletes submitted incidents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingDraft(null);
            setCurrentPage('report');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition self-start whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Emergency Report</span>
        </button>
      </div>

      {/* Search, Category Filter & Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drafts by ID, description, location..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter drafts by category"
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            aria-label="Sort drafts by last modified"
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Sort: Recently Modified</option>
            <option value="oldest">Sort: Oldest Modified</option>
          </select>
        </div>
      </div>

      {/* Draft Cards */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileEdit className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-bold text-slate-800 text-sm">No Local Draft Reports Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Any emergency report saved as a draft while online or offline will be stored in IndexedDB and listed here.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingDraft(null);
              setCurrentPage('report');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Create New Draft Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrafts.map((draft) => {
            const completion = calculateCompletionStatus(draft);
            return (
              <div
                key={draft.id}
                className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {draft.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge label={draft.category || 'Flood'} variant="neutral" />
                      {draft.severity && <Badge label={draft.severity} variant="severity" />}
                    </div>
                  </div>

                  <h2 className="font-bold text-slate-900 text-base">
                    {draft.title || 'Untitled Draft Report'}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {draft.description || 'No description entered yet.'}
                  </p>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {draft.address ||
                        (draft.latitude && draft.longitude
                          ? `${draft.latitude}, ${draft.longitude}`
                          : 'Location not specified')}
                    </span>
                  </div>

                  {/* Completion Status Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span>Completion Status: <strong>{completion.label}</strong></span>
                      <span className="font-mono tabular-nums font-semibold">{completion.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          completion.percent === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${completion.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Edited{' '}
                      {new Date(draft.lastEdited).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleContinueEditing(draft)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Continue Editing</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateDraft(draft.id)}
                      title="Duplicate Draft"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(draft.id)}
                      title="Delete Draft"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitDraftAsEmergency(draft)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Emergency</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Local Draft Report"
        message={`Are you sure you want to permanently delete draft ${deleteTargetId} from local IndexedDB storage? Submitted emergency incidents will not be affected.`}
        confirmLabel="Delete Draft"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
