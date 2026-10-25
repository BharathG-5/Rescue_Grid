import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCategory, ResourceItem, SeverityLevel } from '../types';
import {
  Box,
  AlertTriangle,
  Plus,
  Edit3,
  CheckCircle2,
  Clock,
  ClipboardList,
  X
} from 'lucide-react';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Drinking Water',
  'Food',
  'Medicines',
  'First-Aid Kits',
  'Rescue Equipment',
  'Vehicles',
  'Temporary Shelters',
  'Blankets',
  'Communication Equipment'
];

function isExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const diffDays = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
  return diffDays <= 30;
}

export const ResourceManagement: React.FC = () => {
  const {
    resources,
    resourceRequests,
    incidents,
    addResource,
    editResource,
    updateResourceStock,
    createResourceRequest,
    fulfillResourceRequest
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);

  // Add/Edit form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Drinking Water');
  const [availableQty, setAvailableQty] = useState<number>(100);
  const [requiredQty, setRequiredQty] = useState<number>(500);
  const [unit, setUnit] = useState('Units');
  const [storageLocation, setStorageLocation] = useState('Central Civic Warehouse');
  const [responsibleTeam, setResponsibleTeam] = useState('Sierra Relief & Evacuation Taskforce');
  const [expiryDate, setExpiryDate] = useState('');

  // Resource Request form fields
  const [reqResourceId, setReqResourceId] = useState<string>(resources[0]?.id || 'RES-01');
  const [reqQty, setReqQty] = useState<number>(50);
  const [reqBy, setReqBy] = useState<string>('Sector 4 Field Coordinator');
  const [reqIncidentId, setReqIncidentId] = useState<string>(incidents[0]?.id || '');
  const [reqPriority, setReqPriority] = useState<SeverityLevel>('High');

  const filteredResources = resources.filter(
    (r) => categoryFilter === 'ALL' || r.category === categoryFilter
  );

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Drinking Water');
    setAvailableQty(100);
    setRequiredQty(500);
    setUnit('Units');
    setStorageLocation('Central Civic Warehouse');
    setResponsibleTeam('Sierra Relief & Evacuation Taskforce');
    setExpiryDate('');
    setShowAddModal(true);
  };

  const openEditModal = (item: ResourceItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setAvailableQty(item.availableQty);
    setRequiredQty(item.requiredQty);
    setUnit(item.unit);
    setStorageLocation(item.storageLocation);
    setResponsibleTeam(item.responsibleTeam);
    setExpiryDate(item.expiryDate || '');
    setShowAddModal(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingItem) {
      await editResource(editingItem.id, {
        name: name.trim(),
        category,
        availableQty: Math.max(0, Number(availableQty)),
        requiredQty: Math.max(1, Number(requiredQty)),
        unit: unit.trim(),
        storageLocation: storageLocation.trim(),
        responsibleTeam: responsibleTeam.trim(),
        expiryDate: expiryDate || undefined
      });
    } else {
      await addResource({
        name: name.trim(),
        category,
        availableQty: Math.max(0, Number(availableQty)),
        requiredQty: Math.max(1, Number(requiredQty)),
        unit: unit.trim(),
        storageLocation: storageLocation.trim(),
        responsibleTeam: responsibleTeam.trim(),
        expiryDate: expiryDate || undefined
      });
    }
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRes = resources.find((r) => r.id === reqResourceId);
    if (!targetRes) return;
    await createResourceRequest({
      resourceId: targetRes.id,
      resourceName: targetRes.name,
      category: targetRes.category,
      requestedQty: Math.max(1, Number(reqQty)),
      unit: targetRes.unit,
      requestedBy: reqBy.trim() || 'Field Coordinator',
      incidentId: reqIncidentId || undefined,
      priority: reqPriority
    });
    setShowRequestModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Resource Inventory & Field Requisitions
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DEMO INVENTORY
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Stock changes and fulfilled requests update the Overview Dashboard and Analytics charts immediately.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setReqResourceId(resources[0]?.id || '');
              setShowRequestModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <span>Create Resource Request</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
            categoryFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Categories ({resources.length})
        </button>
        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => {
          const percentage = Math.min(
            100,
            Math.round((res.availableQty / Math.max(1, res.requiredQty)) * 100)
          );
          const isCriticalShortage = percentage < 35;
          const isInsufficient = percentage >= 35 && percentage < 70;
          const expiringSoon = isExpiringSoon(res.expiryDate);

          const statusLabel = isCriticalShortage
            ? 'Critical Shortage'
            : isInsufficient
            ? 'Insufficient Stock'
            : 'Adequate Stock';

          return (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono tabular-nums text-xs font-bold text-slate-500">
                    {res.id} · {res.category}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      isCriticalShortage
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isInsufficient
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{res.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Location: <strong>{res.storageLocation}</strong> · Team: {res.responsibleTeam}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Need Fulfilment</span>
                    <span className="font-mono tabular-nums text-slate-900">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCriticalShortage
                          ? 'bg-red-600'
                          : isInsufficient
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Available vs Required Quantities */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Available Quantity</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                      {res.availableQty} {res.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Required Quantity</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                      {res.requiredQty} {res.unit}
                    </span>
                  </div>
                </div>

                {/* Warnings for Shortages & Expiry */}
                {isCriticalShortage && (
                  <div className="flex items-center gap-1.5 text-xs text-red-800 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Critical stock shortage — below 35% of required threshold.</span>
                  </div>
                )}

                {expiringSoon && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Batch expiring soon ({res.expiryDate}) — prioritize rotation.</span>
                  </div>
                )}
              </div>

              {/* Stock Movement & Edit Controls */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[11px]">Stock Movement:</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateResourceStock(
                        res.id,
                        res.availableQty - (res.requiredQty >= 200 ? 25 : 2),
                        undefined,
                        'Field dispatch deduction'
                      )
                    }
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono font-bold"
                  >
                    -{res.requiredQty >= 200 ? 25 : 2}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateResourceStock(
                        res.id,
                        res.availableQty + (res.requiredQty >= 200 ? 25 : 2),
                        undefined,
                        'Warehouse restock'
                      )
                    }
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-mono font-bold"
                  >
                    +{res.requiredQty >= 200 ? 25 : 2}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(res)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Field Resource Requisitions</h2>
            <p className="text-xs text-slate-500">
              Fulfilling a pending request automatically deducts the requested quantity from warehouse stock.
            </p>
          </div>
          <span className="font-mono tabular-nums text-xs font-bold text-slate-700">
            {resourceRequests.filter((r) => r.status === 'Pending').length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Requested Qty</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resourceRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">{req.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{req.resourceName}</td>
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                    {req.requestedQty} {req.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {req.requestedBy} {req.incidentId ? `(${req.incidentId})` : ''}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{req.priority}</td>
                  <td className="py-3 px-4">
                    {req.status === 'Fulfilled' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Pending Fulfilment</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {req.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => fulfillResourceRequest(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs whitespace-nowrap shrink-0"
                      >
                        Mark Fulfilled
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Resource Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? `Edit Resource (${editingItem.id})` : 'Add New Supply Resource'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveResource} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Portable Water Purification Tablets"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={availableQty}
                    onChange={(e) => setAvailableQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Location</label>
                <input
                  type="text"
                  required
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Team</label>
                  <input
                    type="text"
                    value={responsibleTeam}
                    onChange={(e) => setResponsibleTeam(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  {editingItem ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Resource Request Modal */}
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Field Resource Request</h2>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Resource *</label>
                <select
                  value={reqResourceId}
                  onChange={(e) => setReqResourceId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.availableQty} {r.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Needed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as SeverityLevel)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested By *</label>
                <input
                  type="text"
                  required
                  value={reqBy}
                  onChange={(e) => setReqBy(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Incident (Optional)</label>
                <select
                  value={reqIncidentId}
                  onChange={(e) => setReqIncidentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">None / General Camp Supply</option>
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.id} — {inc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
