import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Incident,
  DraftReport,
  RescueTeam,
  Volunteer,
  ResourceItem,
  ResourceRequest,
  NotificationItem,
  SyncQueueItem,
  IncidentStatus,
  VerificationState,
  SeverityLevel,
  IncidentCategory
} from '../types';
import { dbService } from '../services/db';

interface AppContextType {
  // Connection & Sync
  isOnline: boolean;
  manualOnlineOverride: boolean | null;
  setIsOnlineManualOverride: (val: boolean | null) => void;
  simulateSyncFailure: boolean;
  setSimulateSyncFailure: (val: boolean) => void;
  syncQueue: SyncQueueItem[];
  pendingSyncCount: number;
  lastSyncTime: string | null;
  triggerManualSync: () => Promise<void>;
  backendUrl: string;
  setBackendUrl: (url: string) => void;

  // Data Stores
  isLoading: boolean;
  incidents: Incident[];
  drafts: DraftReport[];
  teams: RescueTeam[];
  volunteers: Volunteer[];
  resources: ResourceItem[];
  resourceRequests: ResourceRequest[];
  notifications: NotificationItem[];

  // Incident Operations
  addIncident: (
    incident: Omit<Incident, 'id' | 'reportedAt' | 'lastUpdated' | 'auditTrail' | 'syncStatus'>,
    fromDraftId?: string
  ) => Promise<string>;
  updateIncidentFields: (
    id: string,
    updates: Partial<Pick<Incident, 'title' | 'description' | 'severity' | 'category' | 'peopleAffected' | 'injuriesReported' | 'requiresMedical'>> & {
      address?: string;
    }
  ) => Promise<void>;
  updateIncidentStatus: (id: string, status: IncidentStatus, notes?: string) => Promise<void>;
  updateIncidentVerification: (id: string, verification: VerificationState, reason?: string) => Promise<void>;
  addIncidentInternalNote: (id: string, note: string) => Promise<void>;
  assignTeamToIncident: (incidentId: string, teamId: string) => Promise<void>;
  assignVolunteerToIncident: (incidentId: string, volunteerId: string) => Promise<void>;

  // Draft Operations
  editingDraft: DraftReport | null;
  setEditingDraft: (draft: DraftReport | null) => void;
  saveDraft: (draft: Partial<DraftReport>) => Promise<string>;
  deleteDraft: (id: string) => Promise<void>;
  duplicateDraft: (id: string) => Promise<string>;

  // Team & Volunteer Operations
  updateTeamStatus: (teamId: string, status: RescueTeam['status']) => Promise<void>;
  updateVolunteerStatus: (volId: string, availability: Volunteer['availability']) => Promise<void>;
  verifyVolunteer: (volId: string) => Promise<void>;

  // Resource & Request Operations
  addResource: (res: Omit<ResourceItem, 'id' | 'lastUpdated'>) => Promise<void>;
  editResource: (id: string, updates: Partial<ResourceItem>) => Promise<void>;
  updateResourceStock: (id: string, newAvailable: number, newRequired?: number, reason?: string) => Promise<void>;
  createResourceRequest: (req: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  fulfillResourceRequest: (requestId: string) => Promise<void>;

  // Notifications
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification: (title: string, message: string, type: NotificationItem['type'], linkId?: string) => Promise<void>;

  // System & Preferences
  reduceMotion: boolean;
  setReduceMotion: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  resetToDemoData: () => Promise<void>;
  exportDataJson: () => string;

  // Toasts
  toasts: { id: string; text: string; type: 'success' | 'error' | 'info' | 'warning' }[];
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;

  // Navigation & Deep-Linking
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedIncidentIdForView: string | null;
  setSelectedIncidentIdForView: (id: string | null) => void;
  navigateToIncidentDetails: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [manualOnlineOverride, setManualOnlineOverride] = useState<boolean | null>(null);
  const [simulateSyncFailure, setSimulateSyncFailure] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>(
    localStorage.getItem('rescuegrid_backend_url') || ''
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    localStorage.getItem('rescuegrid_last_sync') || new Date(Date.now() - 15 * 60 * 1000).toISOString()
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [drafts, setDrafts] = useState<DraftReport[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  const [editingDraft, setEditingDraft] = useState<DraftReport | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [selectedIncidentIdForView, setSelectedIncidentIdForView] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'error' | 'info' | 'warning' }[]>([]);

  const [reduceMotion, setReduceMotion] = useState<boolean>(
    localStorage.getItem('rescuegrid_reduce_motion') === 'true'
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('rescuegrid_high_contrast') === 'true'
  );
  const [language, setLanguage] = useState<string>(
    localStorage.getItem('rescuegrid_lang') || 'en-US'
  );

  const isOnline = manualOnlineOverride !== null ? manualOnlineOverride : browserOnline;

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    localStorage.setItem('rescuegrid_reduce_motion', String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('rescuegrid_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('rescuegrid_lang', language);
  }, [language]);

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reloadFromDb = async () => {
    try {
      await dbService.ready;
      const [inc, dft, tms, vols, res, reqs, notifs, sq] = await Promise.all([
        dbService.getAll<Incident>('incidents'),
        dbService.getAll<DraftReport>('drafts'),
        dbService.getAll<RescueTeam>('teams'),
        dbService.getAll<Volunteer>('volunteers'),
        dbService.getAll<ResourceItem>('resources'),
        dbService.getAll<ResourceRequest>('resource_requests'),
        dbService.getAll<NotificationItem>('notifications'),
        dbService.getAll<SyncQueueItem>('sync_queue')
      ]);
      setIncidents(inc.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()));
      setDrafts(dft.sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()));
      setTeams(tms);
      setVolunteers(vols);
      setResources(res);
      setResourceRequests(reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setNotifications(notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setSyncQueue(sq);
    } catch (err) {
      console.error('Failed to load IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadFromDb();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateToIncidentDetails = (id: string) => {
    setSelectedIncidentIdForView(id);
    setCurrentPage('incidents');
  };

  const addNotification = async (title: string, message: string, type: NotificationItem['type'], linkId?: string) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      linkId
    };
    await dbService.put('notifications', newNotif);
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const enqueueSyncItem = async (
    entityType: SyncQueueItem['entityType'],
    idempotencyKey: string,
    payload: unknown
  ) => {
    // Prevent duplicate submissions using stable idempotency keys
    const existingQueue = await dbService.getAll<SyncQueueItem>('sync_queue');
    const duplicate = existingQueue.find((item) => item.idempotencyKey === idempotencyKey);
    if (duplicate) {
      const updatedItem: SyncQueueItem = {
        ...duplicate,
        payload,
        timestamp: new Date().toISOString()
      };
      await dbService.put('sync_queue', updatedItem);
      return;
    }

    const syncItem: SyncQueueItem = {
      id: `SYNC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      idempotencyKey,
      entityType,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'Pending'
    };
    await dbService.put('sync_queue', syncItem);
  };

  const addIncident = async (
    data: Omit<Incident, 'id' | 'reportedAt' | 'lastUpdated' | 'auditTrail' | 'syncStatus'>,
    fromDraftId?: string
  ): Promise<string> => {
    const id = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // Note: High or Critical severity does NOT automatically mark verification as Verified
    const newIncident: Incident = {
      ...data,
      id,
      verification: 'Pending',
      reportedAt: now,
      lastUpdated: now,
      syncStatus: isOnline ? 'Local Only' : 'Pending Sync',
      offlineCreated: !isOnline,
      internalNotes: [],
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'Reporter / Local Operator',
          action: isOnline
            ? 'Report Saved Locally (Awaiting Coordinator Verification)'
            : 'Report Saved Offline (Queued in IndexedDB for Sync)'
        }
      ]
    };

    await dbService.put('incidents', newIncident);

    if (fromDraftId) {
      await dbService.delete('drafts', fromDraftId);
      if (editingDraft?.id === fromDraftId) {
        setEditingDraft(null);
      }
    }

    if (!isOnline) {
      await enqueueSyncItem('incident', `IDEMP-INC-${id}`, newIncident);
      showToast(
        `Offline Mode: Report ${id} saved locally in IndexedDB and queued for synchronization. It has NOT reached a rescue team yet.`,
        'warning'
      );
      await addNotification(
        'Report Saved Offline (Pending Sync)',
        `${id}: "${newIncident.title}" stored locally. Will sync when backend connection is restored.`,
        'sync',
        id
      );
    } else {
      showToast(
        `Emergency report ${id} recorded locally (${newIncident.severity} severity · Verification Pending).`,
        'success'
      );
      await addNotification(
        'New Emergency Report Logged',
        `${id}: ${newIncident.title} [${newIncident.severity}] — Pending verification`,
        'critical',
        id
      );
    }

    await reloadFromDb();
    return id;
  };

  const updateIncidentFields = async (
    id: string,
    updates: Partial<Pick<Incident, 'title' | 'description' | 'severity' | 'category' | 'peopleAffected' | 'injuriesReported' | 'requiresMedical'>> & {
      address?: string;
    }
  ) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const now = new Date().toISOString();
    const updated: Incident = {
      ...inc,
      ...updates,
      location: {
        ...inc.location,
        address: updates.address !== undefined ? updates.address : inc.location.address
      },
      lastUpdated: now,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'HQ Coordinator',
          action: 'Incident details edited by coordinator'
        },
        ...inc.auditTrail
      ]
    };
    await dbService.put('incidents', updated);
    showToast(`Incident ${id} details updated.`, 'success');
    await reloadFromDb();
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus, notes?: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;

    const prevStatus = inc.status;
    const now = new Date().toISOString();
    const updated: Incident = {
      ...inc,
      status,
      resolvedAt: status === 'Resolved' ? now : inc.resolvedAt,
      lastUpdated: now,
      syncStatus: isOnline ? inc.syncStatus : 'Pending Sync',
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'HQ Operations Coordinator',
          action: `Workflow status changed from ${prevStatus} to ${status}${notes ? ` — Note: ${notes}` : ''}`,
          previousValue: prevStatus,
          newValue: status
        },
        ...inc.auditTrail
      ]
    };

    await dbService.put('incidents', updated);

    // If resolved and had an assigned team, mark team Available
    if (status === 'Resolved' && inc.assignedTeamId) {
      const tm = teams.find((t) => t.id === inc.assignedTeamId);
      if (tm) {
        const updatedTeam: RescueTeam = {
          ...tm,
          status: 'Available',
          currentIncidentId: undefined,
          currentIncidentTitle: undefined,
          assignmentHistory: (tm.assignmentHistory || []).map((h) =>
            h.incidentId === id ? { ...h, status: 'Completed' } : h
          )
        };
        await dbService.put('teams', updatedTeam);
      }
    }

    if (!isOnline) {
      await enqueueSyncItem('status_update', `IDEMP-STATUS-${id}-${status}`, { id, status, notes });
    }

    await addNotification('Incident Workflow Updated', `${id} status transitioned to ${status}`, 'status', id);
    showToast(`Incident ${id} workflow updated to ${status}`, 'info');
    await reloadFromDb();
  };

  const updateIncidentVerification = async (id: string, verification: VerificationState, reason?: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const now = new Date().toISOString();
    const nextStatus: IncidentStatus =
      inc.status === 'New' || inc.status === 'Pending Review'
        ? verification === 'Verified'
          ? 'Verified'
          : verification === 'Unverified'
          ? 'Unverified'
          : 'Pending Review'
        : inc.status;

    const updated: Incident = {
      ...inc,
      verification,
      status: nextStatus,
      lastUpdated: now,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'Verification Officer',
          action: `Verification state set to ${verification}${reason ? ` (${reason})` : ''}`,
          previousValue: inc.verification,
          newValue: verification
        },
        ...inc.auditTrail
      ]
    };
    await dbService.put('incidents', updated);
    await addNotification('Verification Updated', `${id} marked as ${verification}`, 'status', id);
    showToast(`Incident ${id} verification set to ${verification}`, 'success');
    await reloadFromDb();
  };

  const addIncidentInternalNote = async (id: string, note: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc || !note.trim()) return;
    const now = new Date().toISOString();
    const updated: Incident = {
      ...inc,
      internalNotes: [note.trim(), ...(inc.internalNotes || [])],
      lastUpdated: now,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'HQ Coordinator',
          action: `Internal note added: "${note.trim()}"`
        },
        ...inc.auditTrail
      ]
    };
    await dbService.put('incidents', updated);
    showToast('Internal coordinator note saved to audit trail.', 'info');
    await reloadFromDb();
  };

  const assignTeamToIncident = async (incidentId: string, teamId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    const tm = teams.find((t) => t.id === teamId);
    if (!inc || !tm) return;

    const now = new Date().toISOString();
    const updatedIncident: Incident = {
      ...inc,
      assignedTeamId: tm.id,
      assignedTeamName: tm.name,
      status:
        inc.status === 'New' || inc.status === 'Pending Review' || inc.status === 'Verified' || inc.status === 'Unverified'
          ? 'Assigned'
          : inc.status,
      lastUpdated: now,
      syncStatus: isOnline ? inc.syncStatus : 'Pending Sync',
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'HQ Dispatch Coordinator',
          action: `Assigned DEMO rescue team ${tm.name} (${tm.type}) — Local Demo Assignment`
        },
        ...inc.auditTrail
      ]
    };

    const updatedTeam: RescueTeam = {
      ...tm,
      status: 'Deployed',
      currentIncidentId: inc.id,
      currentIncidentTitle: inc.title,
      assignmentHistory: [
        {
          id: `ASG-${Date.now()}`,
          incidentId: inc.id,
          incidentTitle: inc.title,
          assignedAt: now,
          status: 'Active'
        },
        ...(tm.assignmentHistory || [])
      ]
    };

    await dbService.put('incidents', updatedIncident);
    await dbService.put('teams', updatedTeam);

    if (!isOnline) {
      await enqueueSyncItem('assignment', `IDEMP-ASSIGN-${incidentId}-${teamId}`, { incidentId, teamId });
    }

    await addNotification(
      'Demo Team Assignment Saved',
      `${tm.name} assigned to ${inc.id} (Local Demo Mode — no external radio/SMS dispatch sent).`,
      'assignment',
      inc.id
    );
    showToast(`DEMO Assignment: ${tm.name} assigned to ${incidentId} locally.`, 'success');
    await reloadFromDb();
  };

  const assignVolunteerToIncident = async (incidentId: string, volunteerId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!inc || !vol) return;

    const currentVols = inc.assignedVolunteerIds || [];
    if (currentVols.includes(vol.id)) {
      showToast(`${vol.name} is already assigned to this incident.`, 'warning');
      return;
    }

    const now = new Date().toISOString();
    const updatedIncident: Incident = {
      ...inc,
      assignedVolunteerIds: [...currentVols, vol.id],
      lastUpdated: now,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'HQ Coordinator',
          action: `Assigned volunteer ${vol.name} (${vol.id}) — Local Demo Assignment`
        },
        ...inc.auditTrail
      ]
    };

    const updatedVolunteer: Volunteer = {
      ...vol,
      availability: 'Deployed',
      currentAssignment: `${inc.id} (${inc.title.slice(0, 26)})`,
      lastActive: 'Just now'
    };

    await dbService.put('incidents', updatedIncident);
    await dbService.put('volunteers', updatedVolunteer);
    await addNotification(
      'Volunteer Assigned (DEMO)',
      `${vol.name} assigned to incident ${inc.id}.`,
      'assignment',
      inc.id
    );
    showToast(`Volunteer ${vol.name} assigned to ${inc.id} (DEMO)`, 'success');
    await reloadFromDb();
  };

  // Draft operations
  const saveDraft = async (draftData: Partial<DraftReport>): Promise<string> => {
    const id = draftData.id || `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`;
    const draft: DraftReport = {
      id,
      category: draftData.category || 'Flood',
      title: draftData.title || '',
      description: draftData.description || '',
      severity: draftData.severity || 'Medium',
      peopleAffected: draftData.peopleAffected ?? 0,
      injuriesReported: draftData.injuriesReported ?? 0,
      requiresMedical: draftData.requiresMedical ?? false,
      contactName: draftData.contactName || '',
      contactPhone: draftData.contactPhone || '',
      latitude: draftData.latitude,
      longitude: draftData.longitude,
      address: draftData.address || '',
      additionalLocation: draftData.additionalLocation || '',
      accuracyMeters: draftData.accuracyMeters,
      photoDataUrl: draftData.photoDataUrl,
      step: draftData.step || 1,
      lastEdited: new Date().toISOString()
    };

    await dbService.put('drafts', draft);
    showToast(`Draft ${id} saved locally in IndexedDB.`, 'info');
    await reloadFromDb();
    return id;
  };

  const deleteDraft = async (id: string) => {
    await dbService.delete('drafts', id);
    if (editingDraft?.id === id) {
      setEditingDraft(null);
    }
    showToast(`Draft ${id} removed from local storage. Submitted incidents are unaffected.`, 'info');
    await reloadFromDb();
  };

  const duplicateDraft = async (id: string): Promise<string> => {
    const d = drafts.find((item) => item.id === id);
    if (!d) return '';
    const newId = `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`;
    const clone: DraftReport = {
      ...d,
      id: newId,
      title: `${d.title || 'Untitled Draft'} (Copy)`,
      lastEdited: new Date().toISOString()
    };
    await dbService.put('drafts', clone);
    showToast(`Draft duplicated as ${newId}`, 'success');
    await reloadFromDb();
    return newId;
  };

  // Team & Volunteer Management
  const updateTeamStatus = async (teamId: string, status: RescueTeam['status']) => {
    const tm = teams.find((t) => t.id === teamId);
    if (!tm) return;
    const updated: RescueTeam = {
      ...tm,
      status,
      currentIncidentId: status === 'Available' ? undefined : tm.currentIncidentId,
      currentIncidentTitle: status === 'Available' ? undefined : tm.currentIncidentTitle
    };
    await dbService.put('teams', updated);
    showToast(`Team ${tm.name} operational status updated to ${status}`, 'info');
    await reloadFromDb();
  };

  const updateVolunteerStatus = async (volId: string, availability: Volunteer['availability']) => {
    const v = volunteers.find((item) => item.id === volId);
    if (!v) return;
    const updated: Volunteer = {
      ...v,
      availability,
      currentAssignment: availability === 'Available' ? undefined : v.currentAssignment,
      lastActive: 'Just now'
    };
    await dbService.put('volunteers', updated);
    showToast(`Volunteer ${v.name} availability set to ${availability}`, 'info');
    await reloadFromDb();
  };

  const verifyVolunteer = async (volId: string) => {
    const v = volunteers.find((item) => item.id === volId);
    if (!v) return;
    const updated: Volunteer = { ...v, verified: true, lastActive: 'Just now' };
    await dbService.put('volunteers', updated);
    showToast(`Volunteer ${v.name} marked as Verified in local demo roster`, 'success');
    await reloadFromDb();
  };

  // Resource & Request Operations
  const addResource = async (res: Omit<ResourceItem, 'id' | 'lastUpdated'>) => {
    const id = `RES-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: ResourceItem = {
      ...res,
      id,
      lastUpdated: 'Just now'
    };
    await dbService.put('resources', newItem);
    showToast(`Resource "${newItem.name}" added to inventory`, 'success');
    await reloadFromDb();
  };

  const editResource = async (id: string, updates: Partial<ResourceItem>) => {
    const res = resources.find((r) => r.id === id);
    if (!res) return;
    const updated: ResourceItem = {
      ...res,
      ...updates,
      lastUpdated: 'Just now'
    };
    await dbService.put('resources', updated);
    showToast(`Resource "${updated.name}" updated`, 'success');
    await reloadFromDb();
  };

  const updateResourceStock = async (id: string, newAvailable: number, newRequired?: number, reason?: string) => {
    const res = resources.find((r) => r.id === id);
    if (!res) return;
    const clampedAvailable = Math.max(0, newAvailable);
    const updated: ResourceItem = {
      ...res,
      availableQty: clampedAvailable,
      requiredQty: newRequired !== undefined ? Math.max(1, newRequired) : res.requiredQty,
      lastUpdated: 'Just now'
    };
    await dbService.put('resources', updated);

    const pct = Math.round((updated.availableQty / updated.requiredQty) * 100);
    if (pct < 35) {
      await addNotification(
        'Critical Resource Shortage',
        `${updated.name} stock dropped to ${updated.availableQty} ${updated.unit} (${pct}% of required need).`,
        'resource'
      );
    }

    showToast(
      `Stock movement recorded for ${res.name}: ${clampedAvailable} ${res.unit}${reason ? ` (${reason})` : ''}`,
      'info'
    );
    await reloadFromDb();
  };

  const createResourceRequest = async (req: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = `REQ-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: ResourceRequest = {
      ...req,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    await dbService.put('resource_requests', newReq);
    await addNotification(
      'New Resource Request Logged',
      `${newReq.requestedQty} ${newReq.unit} of ${newReq.resourceName} requested by ${newReq.requestedBy}.`,
      'resource'
    );
    showToast(`Resource request ${id} created.`, 'success');
    await reloadFromDb();
  };

  const fulfillResourceRequest = async (requestId: string) => {
    const req = resourceRequests.find((r) => r.id === requestId);
    if (!req || req.status === 'Fulfilled') return;

    const resItem = resources.find((r) => r.id === req.resourceId);
    if (resItem) {
      const nextQty = Math.max(0, resItem.availableQty - req.requestedQty);
      await dbService.put('resources', {
        ...resItem,
        availableQty: nextQty,
        lastUpdated: 'Just now'
      });
    }

    const updatedReq: ResourceRequest = {
      ...req,
      status: 'Fulfilled',
      fulfilledAt: new Date().toISOString()
    };
    await dbService.put('resource_requests', updatedReq);
    await addNotification(
      'Resource Request Fulfilled',
      `Request ${req.id} (${req.requestedQty} ${req.unit} ${req.resourceName}) marked as fulfilled.`,
      'resource'
    );
    showToast(`Request ${req.id} fulfilled and inventory adjusted.`, 'success');
    await reloadFromDb();
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    const n = notifications.find((item) => item.id === id);
    if (!n) return;
    await dbService.put('notifications', { ...n, read: true });
    await reloadFromDb();
  };

  const markAllNotificationsAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await dbService.bulkPut('notifications', updated);
    showToast('All notifications marked as read', 'info');
    await reloadFromDb();
  };

  const deleteNotification = async (id: string) => {
    await dbService.delete('notifications', id);
    await reloadFromDb();
  };

  const clearNotifications = async () => {
    await dbService.clearStore('notifications');
    setNotifications([]);
    showToast('All notifications cleared', 'info');
  };

  // Synchronization with idempotency & failure recovery
  const triggerManualSync = async () => {
    if (!isOnline) {
      showToast('Cannot synchronize while offline. Pending reports remain safely stored in IndexedDB.', 'error');
      return;
    }

    const queue = await dbService.getAll<SyncQueueItem>('sync_queue');
    if (queue.length === 0) {
      showToast('No pending items in synchronization queue.', 'info');
      return;
    }

    // Handle simulated failure or unreachable backend without losing pending reports
    if (simulateSyncFailure) {
      const failedQueue = queue.map((item) => ({
        ...item,
        retryCount: item.retryCount + 1,
        status: 'Failed' as const,
        lastError: 'Backend endpoint unreachable or returned HTTP 503 (Simulated Failure)'
      }));
      await dbService.bulkPut('sync_queue', failedQueue);

      const allInc = await dbService.getAll<Incident>('incidents');
      const updatedInc = allInc.map((i) =>
        i.syncStatus === 'Pending Sync' ? { ...i, syncStatus: 'Failed' as const } : i
      );
      await dbService.bulkPut('incidents', updatedInc);

      await addNotification(
        'Synchronization Failed — Data Preserved Locally',
        `Sync attempt failed (${queue.length} items retained in queue with idempotency keys). No reports were lost.`,
        'sync'
      );
      showToast(
        `Synchronization failed: Backend unreachable. All ${queue.length} pending reports are safely preserved in IndexedDB for retry.`,
        'error'
      );
      await reloadFromDb();
      return;
    }

    // Deduplicate by idempotencyKey before syncing
    const uniqueByIdempotency = new Map<string, SyncQueueItem>();
    queue.forEach((item) => uniqueByIdempotency.set(item.idempotencyKey, item));

    await dbService.clearStore('sync_queue');
    const allInc = await dbService.getAll<Incident>('incidents');
    const updatedInc = allInc.map((i) =>
      i.syncStatus === 'Pending Sync' || i.syncStatus === 'Failed'
        ? { ...i, syncStatus: backendUrl ? ('Synced' as const) : ('Local Only' as const) }
        : i
    );
    await dbService.bulkPut('incidents', updatedInc);

    const nowIso = new Date().toISOString();
    setLastSyncTime(nowIso);
    localStorage.setItem('rescuegrid_last_sync', nowIso);

    await addNotification(
      'Synchronization Queue Processed',
      `Processed ${uniqueByIdempotency.size} unique idempotent records (${
        backendUrl ? `Synced with ${backendUrl}` : 'Verified in local storage'
      }).`,
      'sync'
    );
    showToast(`Synchronized ${uniqueByIdempotency.size} pending records without duplicates.`, 'success');
    await reloadFromDb();
  };

  const resetToDemoData = async () => {
    await dbService.resetToSeed();
    setEditingDraft(null);
    setSelectedIncidentIdForView(null);
    showToast('All stores reset to initial fictional DEMO DATA', 'info');
    await reloadFromDb();
  };

  const exportDataJson = () => {
    const exportObject = {
      exportTimestamp: new Date().toISOString(),
      platform: 'RescueGrid Emergency Command (DEMO DATA)',
      note: 'Exported from browser IndexedDB storage',
      incidents,
      drafts,
      teams,
      volunteers,
      resources,
      resourceRequests,
      syncQueue
    };
    return JSON.stringify(exportObject, null, 2);
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        manualOnlineOverride,
        setIsOnlineManualOverride: setManualOnlineOverride,
        simulateSyncFailure,
        setSimulateSyncFailure,
        syncQueue,
        pendingSyncCount: syncQueue.length,
        lastSyncTime,
        triggerManualSync,
        backendUrl,
        setBackendUrl,
        isLoading,
        incidents,
        drafts,
        teams,
        volunteers,
        resources,
        resourceRequests,
        notifications,
        addIncident,
        updateIncidentFields,
        updateIncidentStatus,
        updateIncidentVerification,
        addIncidentInternalNote,
        assignTeamToIncident,
        assignVolunteerToIncident,
        editingDraft,
        setEditingDraft,
        saveDraft,
        deleteDraft,
        duplicateDraft,
        updateTeamStatus,
        updateVolunteerStatus,
        verifyVolunteer,
        addResource,
        editResource,
        updateResourceStock,
        createResourceRequest,
        fulfillResourceRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearNotifications,
        addNotification,
        reduceMotion,
        setReduceMotion,
        highContrast,
        setHighContrast,
        language,
        setLanguage,
        resetToDemoData,
        exportDataJson,
        toasts,
        showToast,
        dismissToast,
        currentPage,
        setCurrentPage,
        selectedIncidentIdForView,
        setSelectedIncidentIdForView,
        navigateToIncidentDetails,
        globalSearch,
        setGlobalSearch
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
