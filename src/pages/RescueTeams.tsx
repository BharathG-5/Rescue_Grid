import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RescueTeam } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Radio, Users, Phone, MapPin, X, History, CheckCircle2 } from 'lucide-react';

export const RescueTeams: React.FC = () => {
  const { teams, incidents, updateTeamStatus, assignTeamToIncident } = useApp();

  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
  const [capabilityFilter, setCapabilityFilter] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<RescueTeam | null>(null);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');
  const [confirmAssignOpen, setConfirmAssignOpen] = useState<boolean>(false);

  const allCapabilities = Array.from(new Set(teams.flatMap((t) => t.capabilities)));

  const filteredTeams = teams.filter((t) => {
    const matchStatus = availabilityFilter === 'ALL' || t.status === availabilityFilter;
    const matchCap = capabilityFilter === 'ALL' || t.capabilities.includes(capabilityFilter);
    return matchStatus && matchCap;
  });

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const selectedIncidentObj = incidents.find((i) => i.id === targetIncidentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rescue Team Management
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO UNITS
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            In frontend demo mode, unit assignments are persisted locally in IndexedDB and do not contact real rescue personnel.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            aria-label="Filter teams by availability"
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Availability States</option>
            <option value="Available">Available</option>
            <option value="Deployed">Deployed</option>
            <option value="Resting">Resting</option>
            <option value="Offline">Offline</option>
          </select>

          <select
            value={capabilityFilter}
            onChange={(e) => setCapabilityFilter(e.target.value)}
            aria-label="Filter teams by capability"
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Capabilities</option>
            {allCapabilities.map((cap) => (
              <option key={cap} value={cap}>
                {cap}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono tabular-nums text-xs font-bold text-slate-500">
                  {team.id} · DEMO
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                    team.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : team.status === 'Deployed'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {team.status}
                </span>
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-base">{team.name}</h2>
                <p className="text-xs text-blue-700 font-semibold">{team.type}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="font-mono tabular-nums text-slate-900">{team.membersCount}</strong> members · Lead:{' '}
                    <strong className="text-slate-800">{team.leader}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{team.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Service Area: {team.serviceArea}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Skills & Capabilities
                </span>
                <div className="text-xs text-slate-700">
                  {team.capabilities.join(' · ')}
                </div>
              </div>

              {team.currentIncidentTitle && (
                <div className="bg-blue-50/80 border border-blue-200 p-2.5 rounded-lg text-xs">
                  <span className="font-bold text-blue-950 block text-[11px]">
                    Current DEMO Assignment ({team.currentIncidentId})
                  </span>
                  <span className="text-blue-900 font-medium">{team.currentIncidentTitle}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-xs">
              <select
                value={team.status}
                onChange={(e) => updateTeamStatus(team.id, e.target.value as RescueTeam['status'])}
                aria-label={`Update status for ${team.name}`}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
              >
                <option value="Available">Available</option>
                <option value="Deployed">Deployed</option>
                <option value="Resting">Resting</option>
                <option value="Offline">Offline</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedTeam(team);
                  setTargetIncidentId(activeIncidents[0]?.id || '');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition whitespace-nowrap shrink-0"
              >
                Details & Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Team Detail & Incident Assignment Modal */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedTeam.id} · DEMO</span>
                <h2 className="text-base font-extrabold text-slate-900">{selectedTeam.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Close team details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-semibold">Team Type</span>
                  <span className="font-bold text-slate-900">{selectedTeam.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Operational Status</span>
                  <span className="font-bold text-slate-900">{selectedTeam.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Service Area</span>
                  <span className="font-bold text-slate-900">{selectedTeam.serviceArea}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Personnel Count</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {selectedTeam.membersCount} responders
                  </span>
                </div>
              </div>

              {/* Assign Incident Interface */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>Assign Incident to {selectedTeam.name} (DEMO)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={targetIncidentId}
                    onChange={(e) => setTargetIncidentId(e.target.value)}
                    aria-label="Select incident to assign"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {activeIncidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {inc.id} — {inc.title} [{inc.severity}]
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!targetIncidentId}
                    onClick={() => setConfirmAssignOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                  >
                    Assign Unit
                  </button>
                </div>
              </div>

              {/* Assignment History */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-600" />
                  <span>Unit Assignment History</span>
                </h3>
                {(!selectedTeam.assignmentHistory || selectedTeam.assignmentHistory.length === 0) ? (
                  <p className="text-slate-500 py-2">No historical assignments recorded for this unit.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedTeam.assignmentHistory.map((rec) => (
                      <div key={rec.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">
                            {rec.incidentId} · {rec.incidentTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Assigned {new Date(rec.assignedAt).toLocaleString()}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{rec.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmAssignOpen}
        title="Confirm DEMO Rescue Team Assignment"
        message={`Assign ${selectedTeam?.name} to ${selectedIncidentObj?.id} (${selectedIncidentObj?.title})? In frontend demo mode, this assignment is stored locally in IndexedDB and does not contact a real rescue team.`}
        details={
          selectedTeam && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><strong>Selected Team:</strong> {selectedTeam.name} ({selectedTeam.id})</div>
              <div><strong>Capabilities:</strong> {selectedTeam.capabilities.join(', ')}</div>
              <div><strong>Target Incident:</strong> {selectedIncidentObj?.id} — {selectedIncidentObj?.location.address}</div>
            </div>
          )
        }
        confirmLabel="Confirm DEMO Assignment"
        variant="primary"
        onConfirm={async () => {
          if (selectedTeam && targetIncidentId) {
            await assignTeamToIncident(targetIncidentId, selectedTeam.id);
            setConfirmAssignOpen(false);
            setSelectedTeam(null);
          }
        }}
        onCancel={() => setConfirmAssignOpen(false)}
      />
    </div>
  );
};
