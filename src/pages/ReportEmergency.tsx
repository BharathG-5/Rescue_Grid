import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentCategory, SeverityLevel } from '../types';
import { LocationPickerLeafletMap } from '../components/map/LocationPickerLeafletMap';
import {
  Save,
  Send,
  Crosshair,
  Flame,
  Waves,
  Building,
  HeartPulse,
  UserX,
  Mountain,
  Car,
  Biohazard,
  Camera,
  AlertCircle,
  WifiOff,
  CheckCircle2,
  X
} from 'lucide-react';

export const ReportEmergency: React.FC = () => {
  const {
    addIncident,
    saveDraft,
    editingDraft,
    setEditingDraft,
    setCurrentPage,
    isOnline,
    showToast
  } = useApp();

  const [draftId, setDraftId] = useState<string | undefined>(editingDraft?.id);
  const [category, setCategory] = useState<IncidentCategory>(editingDraft?.category || 'Flood');
  const [title, setTitle] = useState(editingDraft?.title || '');
  const [description, setDescription] = useState(editingDraft?.description || '');
  const [severity, setSeverity] = useState<SeverityLevel>(editingDraft?.severity || 'High');
  const [peopleAffected, setPeopleAffected] = useState<number>(editingDraft?.peopleAffected ?? 1);
  const [injuriesReported, setInjuriesReported] = useState<number>(editingDraft?.injuriesReported ?? 0);
  const [requiresMedical, setRequiresMedical] = useState<boolean>(editingDraft?.requiresMedical ?? false);
  const [address, setAddress] = useState(editingDraft?.address || '');
  const [additionalLocation, setAdditionalLocation] = useState(editingDraft?.additionalLocation || '');
  const [latitude, setLatitude] = useState<number | undefined>(editingDraft?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(editingDraft?.longitude);
  const [accuracyMeters, setAccuracyMeters] = useState<number | undefined>(editingDraft?.accuracyMeters);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(editingDraft?.photoDataUrl);
  const [contactName, setContactName] = useState(editingDraft?.contactName || '');
  const [contactPhone, setContactPhone] = useState(editingDraft?.contactPhone || '');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'acquired' | 'denied'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingDraft) {
      setDraftId(editingDraft.id);
      setCategory(editingDraft.category || 'Flood');
      setTitle(editingDraft.title || '');
      setDescription(editingDraft.description || '');
      setSeverity(editingDraft.severity || 'High');
      setPeopleAffected(editingDraft.peopleAffected ?? 1);
      setInjuriesReported(editingDraft.injuriesReported ?? 0);
      setRequiresMedical(editingDraft.requiresMedical ?? false);
      setAddress(editingDraft.address || '');
      setAdditionalLocation(editingDraft.additionalLocation || '');
      setLatitude(editingDraft.latitude);
      setLongitude(editingDraft.longitude);
      setAccuracyMeters(editingDraft.accuracyMeters);
      setPhotoDataUrl(editingDraft.photoDataUrl);
      setContactName(editingDraft.contactName || '');
      setContactPhone(editingDraft.contactPhone || '');
    }
  }, [editingDraft]);

  const categories: { label: IncidentCategory; icon: React.ElementType }[] = [
    { label: 'Flood', icon: Waves },
    { label: 'Urban Fire', icon: Flame },
    { label: 'Structural Collapse', icon: Building },
    { label: 'Medical Emergency', icon: HeartPulse },
    { label: 'Missing Person', icon: UserX },
    { label: 'Landslide', icon: Mountain },
    { label: 'Road Accident', icon: Car },
    { label: 'Chemical Hazard', icon: Biohazard }
  ];

  // Browser Geolocation API with honest permission & accuracy handling
  const handleGetLocation = () => {
    setGpsStatus('loading');
    setGpsMessage(null);

    if (!('geolocation' in navigator)) {
      setGpsStatus('denied');
      setGpsMessage(
        'Browser Geolocation API is unavailable in this environment. Please enter coordinates manually or click a point on the map.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const acc = position.coords.accuracy ? Math.round(position.coords.accuracy) : undefined;
        setLatitude(lat);
        setLongitude(lng);
        setAccuracyMeters(acc);
        setGpsStatus('acquired');
        setGpsMessage(
          `Browser GPS coordinates acquired (${lat}, ${lng})${
            acc ? ` with reported accuracy ±${acc} metres` : ''
          }. Note: Coordinates are unverified raw GPS readings; please enter or confirm the street address manually below.`
        );
        showToast(`GPS coordinates acquired (${lat}, ${lng})`, 'success');
      },
      (err) => {
        setGpsStatus('denied');
        setAccuracyMeters(undefined);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsMessage(
            'Location permission was denied. GPS is not available. Please enter the location address and coordinates manually or select a pin on the map picker below.'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsMessage(
            'Location position is unavailable from the device sensor. Please enter coordinates manually or pick on the map.'
          );
        } else {
          setGpsMessage(
            `GPS request timed out or failed (${err.message}). Please use manual coordinate entry or the map picker.`
          );
        }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Please select an image smaller than 2 MB for local IndexedDB storage.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAsDraft = async () => {
    const savedLatitude = Number.isFinite(latitude) ? latitude : undefined;
    const savedLongitude = Number.isFinite(longitude) ? longitude : undefined;
    const savedId = await saveDraft({
      id: draftId,
      category,
      title: title.trim() || `${category} Draft Report`,
      description,
      severity,
      peopleAffected,
      injuriesReported,
      requiresMedical,
      address,
      additionalLocation,
      latitude: savedLatitude,
      longitude: savedLongitude,
      accuracyMeters,
      photoDataUrl,
      contactName,
      contactPhone,
      step: 2
    });
    setDraftId(savedId);
    setEditingDraft(null);
    setCurrentPage('drafts');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide an emergency headline and detailed description.', 'error');
      return;
    }
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude === undefined ||
      longitude === undefined ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      showToast('Select a valid emergency location on the map, use your current location, or enter valid coordinates.', 'error');
      return;
    }
    if (!consentGiven) {
      showToast('Please confirm the emergency reporting consent notice before submitting.', 'error');
      return;
    }

    await addIncident(
      {
        category,
        title: title.trim(),
        description: description.trim(),
        severity,
        verification: 'Pending',
        status: 'New',
        location: {
          address: address.trim() || `Unverified Coordinates (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
          latitude,
          longitude,
          accuracyMeters,
          details: additionalLocation.trim() || undefined
        },
        peopleAffected: Math.max(0, Number(peopleAffected) || 0),
        injuriesReported: Math.max(0, Number(injuriesReported) || 0),
        requiresMedical,
        photoDataUrl,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        assignedVolunteerIds: []
      },
      draftId
    );

    setCurrentPage('incidents');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {draftId ? `Continue Editing Draft (${draftId})` : 'Report Emergency Incident'}
            </h1>
            {!isOnline && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded">
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode — Saves Locally
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            All submitted reports enter the <strong>New → Pending Verification</strong> workflow. High or Critical severity does not automatically verify a report.
          </p>
        </div>
        {draftId && (
          <button
            type="button"
            onClick={() => {
              setEditingDraft(null);
              setDraftId(undefined);
              setTitle('');
              setDescription('');
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg self-start"
          >
            Start Fresh Report
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Emergency Category */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <h2 className="text-xs font-bold text-slate-800">
            01. Emergency Category Selection
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.label;
              return (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold transition text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Severity, Description & Impact */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xs font-bold text-slate-800">
            02. Severity, Description & Affected Persons
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="inc-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Headline / Summary *
              </label>
              <input
                id="inc-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Flash flood stranded 8 residents on second-floor terrace"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reported Severity Level * <span className="font-normal text-slate-500">(Independent of coordinator verification)</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { level: 'Critical', desc: 'Immediate life threat', activeCls: 'border-red-600 bg-red-50 text-red-900' },
                    { level: 'High', desc: 'Serious hazard', activeCls: 'border-amber-600 bg-amber-50 text-amber-900' },
                    { level: 'Medium', desc: 'Property / non-life', activeCls: 'border-yellow-600 bg-yellow-50 text-yellow-900' },
                    { level: 'Low', desc: 'Minor / advisory', activeCls: 'border-blue-600 bg-blue-50 text-blue-900' }
                  ] as const
                ).map((item) => (
                  <button
                    type="button"
                    key={item.level}
                    onClick={() => setSeverity(item.level)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      severity === item.level
                        ? `${item.activeCls} ring-2 ring-slate-900/10`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.level}</div>
                    <div className="text-[11px] opacity-80">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="people-affected" className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated People Affected (if known)
              </label>
              <input
                id="people-affected"
                type="number"
                min="0"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(Number(e.target.value))}
                className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="injuries-count" className="block text-xs font-semibold text-slate-700 mb-1">
                Reported Injuries (if known)
              </label>
              <input
                id="injuries-count"
                type="number"
                min="0"
                value={injuriesReported}
                onChange={(e) => setInjuriesReported(Number(e.target.value))}
                className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="inc-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Emergency Description & Medical Needs *
              </label>
              <textarea
                id="inc-desc"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible hazards, access constraints, medical needs, or structural risks..."
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="req-medical"
                checked={requiresMedical}
                onChange={(e) => setRequiresMedical(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="req-medical" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Immediate Paramedic / Trauma Medical Support Required
              </label>
            </div>
          </div>
        </section>

        {/* Step 3: Location & GPS Integration */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-800">
                03. Location, Browser GPS & Map Picker
              </h2>
              <p className="text-[11px] text-slate-500">
                Use Browser Geolocation, click on the OpenStreetMap picker, or edit coordinates manually before submitting.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsStatus === 'loading'}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition self-start whitespace-nowrap shrink-0"
            >
              <Crosshair className={`w-3.5 h-3.5 ${gpsStatus === 'loading' ? 'animate-spin' : ''}`} />
              <span>{gpsStatus === 'loading' ? 'Requesting GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {gpsMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                gpsStatus === 'acquired'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
              role="alert"
            >
              {gpsStatus === 'acquired' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{gpsMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lat-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Latitude *
              </label>
              <input
                id="lat-input"
                type="number"
                step="0.00001"
                value={latitude ?? ''}
                onChange={(e) => {
                  setLatitude(e.target.value === '' ? undefined : Number(e.target.value));
                  setAccuracyMeters(undefined);
                }}
                className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lng-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Longitude *
              </label>
              <input
                id="lng-input"
                type="number"
                step="0.00001"
                value={longitude ?? ''}
                onChange={(e) => {
                  setLongitude(e.target.value === '' ? undefined : Number(e.target.value));
                  setAccuracyMeters(undefined);
                }}
                className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GPS Accuracy (Metres)
              </label>
              <div className="w-full text-sm font-mono tabular-nums px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                {accuracyMeters !== undefined ? `±${accuracyMeters} m` : 'Manual / Unspecified'}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addr-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address or Area Name (Enter manually if unknown)
              </label>
              <input
                id="addr-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Sector 4 Promenade, Near Metro Pillar 42"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="add-loc-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Location Details
              </label>
              <input
                id="add-loc-input"
                type="text"
                value={additionalLocation}
                onChange={(e) => setAdditionalLocation(e.target.value)}
                placeholder="Floor, gate, landmark..."
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">
              {Number.isFinite(latitude) && Number.isFinite(longitude)
                ? `Selected coordinates: ${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`
                : 'No emergency location selected yet.'}
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('emergency-location-picker')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
            >
              Select or change location on map
            </button>
            {(latitude !== undefined || longitude !== undefined) && (
              <button
                type="button"
                onClick={() => {
                  setLatitude(undefined);
                  setLongitude(undefined);
                  setAccuracyMeters(undefined);
                  setGpsStatus('idle');
                  setGpsMessage(null);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" /> Clear location
              </button>
            )}
          </div>
          <div id="emergency-location-picker">
            <LocationPickerLeafletMap
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setAccuracyMeters(undefined);
                setGpsStatus('idle');
                setGpsMessage(null);
              }}
            />
          </div>
        </section>

        {/* Step 4: Optional Photo, Contact Info & Consent */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xs font-bold text-slate-800">
            04. Optional Photo Evidence, Contact Information & Consent
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Reporter Name (Optional)
              </label>
              <input
                id="contact-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name or callsign"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="photo-upload" className="block text-xs font-semibold text-slate-700 mb-1">
                Photo Attachment (Optional)
              </label>
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-500" />
                <span>{photoDataUrl ? 'Replace Photo' : 'Attach Scene Photo'}</span>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {photoDataUrl && (
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <img
                src={photoDataUrl}
                alt="Attached emergency scene preview"
                className="w-16 h-16 object-cover rounded border border-slate-300"
              />
              <div className="flex-1 text-xs text-slate-600">
                Photo stored locally as Data URL for offline resilience.
              </div>
              <button
                type="button"
                onClick={() => setPhotoDataUrl(undefined)}
                className="p-1 text-slate-500 hover:text-red-600"
                aria-label="Remove attached photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="consent-checkbox" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              <strong>Privacy & Dispatch Notice:</strong> I understand this report is stored in local IndexedDB storage and queued for coordinator review. When offline, saving or submitting a report stores it locally on this device and does not contact a live rescue team until backend connectivity is established and verified.
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveAsDraft}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>Save as Local Draft</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            <span>
              {isOnline
                ? 'Submit Emergency Report'
                : 'Save Report Offline (Pending Sync)'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
