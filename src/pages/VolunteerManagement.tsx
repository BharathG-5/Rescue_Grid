import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volunteer, VolunteerSkill } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Users,
  CheckCircle2,
  Activity,
  UserX,
  ShieldAlert,
  Search,
  ShieldCheck,
  X,
  HeartPulse,
  Flame,
  Compass,
  Truck,
  Package,
  Radio,
  Home,
  Cross
} from 'lucide-react';

const SKILL_CONFIG: Record<
  VolunteerSkill,
  { icon: React.ElementType; colorCls: string }
> = {
  'First Aid': { icon: Cross, colorCls: 'text-red-700 bg-red-50 border-red-200' },
  'Medical Support': { icon: HeartPulse, colorCls: 'text-rose-700 bg-rose-50 border-rose-200' },
  'Search & Rescue': { icon: Compass, colorCls: 'text-blue-700 bg-blue-50 border-blue-200' },
  'Fire Safety': { icon: Flame, colorCls: 'text-amber-800 bg-amber-50 border-amber-200' },
  Transport: { icon: Truck, colorCls: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  Logistics: { icon: Package, colorCls: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  Communications: { icon: Radio, colorCls: 'text-purple-700 bg-purple-50 border-purple-200' },
  'Shelter Support': { icon: Home, colorCls: 'text-slate-700 bg-slate-100 border-slate-200' }
};

export const VolunteerManagement: React.FC = () => {
  const {
    volunteers,
    incidents,
    updateVolunteerStatus,
    verifyVolunteer,
    assignVolunteerToIncident
  } = useApp();

  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');
  const [confirmVerifyOpen, setConfirmVerifyOpen] = useState<boolean>(false);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState<boolean>(false);

  // 5 Required Summary Cards
  const totalVols = volunteers.length;
  const availableVols = volunteers.filter((v) => v.availability === 'Available').length;
  const deployedVols = volunteers.filter((v) => v.availability === 'Deployed').length;
  const unavailableVols = volunteers.filter(
    (v) => v.availability === 'Unavailable' || v.availability === 'Off Duty'
  ).length;
  const unverifiedVols = volunteers.filter((v) => !v.verified).length;

  const filtered = volunteers.filter((v) => {
    const matchesSearch =
      !search ||
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesAvail = availabilityFilter === 'ALL' || v.availability === availabilityFilter;
    const matchesSkill = skillFilter === 'ALL' || v.skills.includes(skillFilter as VolunteerSkill);
    return matchesSearch && matchesAvail && matchesSkill;
  });

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Volunteer Roster & Skills Directory
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO ROSTER
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            All listed records are fictional DEMO volunteers stored in local IndexedDB. No real personal identities or external credentials are claimed.
          </p>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1.5">
            {totalVols}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fictional demo profiles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1.5">
            {availableVols}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for assignment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Deployed</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-blue-700 mt-1.5">
            {deployedVols}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Assigned to incidents</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Unavailable / Off</span>
            <UserX className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-800 mt-1.5">
            {unavailableVols}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Resting or unavailable</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Needs Verification</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-700 mt-1.5">
            {unverifiedVols}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending coordinator review</div>
        </div>
      </div>

      {/* Visual Skills Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
        <div className="text-xs font-bold text-slate-800">
          Visual Skills Directory (Click to Filter Roster)
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSkillFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
              skillFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Skills ({volunteers.length})
          </button>
          {(Object.keys(SKILL_CONFIG) as VolunteerSkill[]).map((skill) => {
            const cfg = SKILL_CONFIG[skill];
            const Icon = cfg.icon;
            const isSelected = skillFilter === skill;
            return (
              <button
                type="button"
                key={skill}
                onClick={() => setSkillFilter(isSelected ? 'ALL' : skill)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : `${cfg.colorCls} hover:opacity-90`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Availability Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by volunteer name, ID, or skill..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            aria-label="Filter volunteers by availability"
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700"
          >
            <option value="ALL">All Availability</option>
            <option value="Available">Available</option>
            <option value="Deployed">Deployed</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Volunteer ID</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Current Assignment</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No volunteers match your search or skill filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {vol.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{vol.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{vol.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {vol.skills.map((skill) => {
                          const cfg = SKILL_CONFIG[skill];
                          const Icon = cfg?.icon || Users;
                          return (
                            <span
                              key={skill}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                cfg?.colorCls || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{skill}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={vol.availability}
                        onChange={(e) =>
                          updateVolunteerStatus(vol.id, e.target.value as Volunteer['availability'])
                        }
                        aria-label={`Change availability for ${vol.name}`}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-800"
                      >
                        <option value="Available">Available</option>
                        <option value="Deployed">Deployed</option>
                        <option value="Unavailable">Unavailable</option>
                        <option value="Off Duty">Off Duty</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                      {vol.currentAssignment || <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {vol.lastActive}
                    </td>
                    <td className="py-3 px-4">
                      {vol.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Verified (DEMO)</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold text-xs">
                          Pending Review (DEMO)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVolunteer(vol);
                          setTargetIncidentId(activeIncidents[0]?.id || '');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs whitespace-nowrap shrink-0"
                      >
                        Inspect / Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Volunteer Detail Drawer / Modal */}
      {selectedVolunteer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedVolunteer.id} · DEMO VOLUNTEER
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  {selectedVolunteer.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVolunteer(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Close volunteer drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-semibold">Phone (Fictional)</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {selectedVolunteer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Email (Fictional)</span>
                  <span className="text-slate-900 font-semibold">{selectedVolunteer.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Joined Date</span>
                  <span className="font-mono text-slate-900">{selectedVolunteer.joinedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Verification Status</span>
                  <span className="font-bold text-slate-900">
                    {selectedVolunteer.verified ? 'Verified (DEMO)' : 'Requires Verification'}
                  </span>
                </div>
              </div>

              {!selectedVolunteer.verified && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-950">Volunteer Requires Verification</div>
                    <div className="text-[11px] text-amber-800">
                      Mark this demo volunteer profile as verified for field assignment.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmVerifyOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                  >
                    Verify Profile
                  </button>
                </div>
              )}

              {/* Assign Volunteer to Incident */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">
                  Assign Volunteer to Active Incident (DEMO)
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={targetIncidentId}
                    onChange={(e) => setTargetIncidentId(e.target.value)}
                    aria-label="Select incident for volunteer assignment"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Confirmation */}
      <ConfirmModal
        isOpen={confirmVerifyOpen}
        title="Verify DEMO Volunteer Profile"
        message={`Mark ${selectedVolunteer?.name} as Verified in the local demo volunteer directory?`}
        confirmLabel="Mark Verified"
        variant="primary"
        onConfirm={async () => {
          if (selectedVolunteer) {
            await verifyVolunteer(selectedVolunteer.id);
            setConfirmVerifyOpen(false);
            setSelectedVolunteer({ ...selectedVolunteer, verified: true });
          }
        }}
        onCancel={() => setConfirmVerifyOpen(false)}
      />

      {/* Assignment Confirmation */}
      <ConfirmModal
        isOpen={confirmAssignOpen}
        title="Confirm DEMO Volunteer Assignment"
        message={`Assign ${selectedVolunteer?.name} to incident ${targetIncidentId}? This assignment updates local IndexedDB records for demonstration.`}
        confirmLabel="Confirm Assignment"
        variant="primary"
        onConfirm={async () => {
          if (selectedVolunteer && targetIncidentId) {
            await assignVolunteerToIncident(targetIncidentId, selectedVolunteer.id);
            setConfirmAssignOpen(false);
            setSelectedVolunteer(null);
          }
        }}
        onCancel={() => setConfirmAssignOpen(false)}
      />
    </div>
  );
};
