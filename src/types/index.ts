export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentCategory =
  | 'Flood'
  | 'Structural Collapse'
  | 'Urban Fire'
  | 'Medical Emergency'
  | 'Missing Person'
  | 'Landslide'
  | 'Road Accident'
  | 'Chemical Hazard';

export type IncidentStatus =
  | 'New'
  | 'Pending Review'
  | 'Verified'
  | 'Unverified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Failed';

export type VerificationState = 'Pending' | 'Verified' | 'Unverified';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  note?: string;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  title: string;
  description: string;
  severity: SeverityLevel;
  verification: VerificationState;
  status: IncidentStatus;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    details?: string;
  };
  peopleAffected: number;
  injuriesReported: number;
  requiresMedical: boolean;
  contactName?: string;
  contactPhone?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedVolunteerIds: string[];
  reportedAt: string;
  lastUpdated: string;
  resolvedAt?: string;
  offlineCreated?: boolean;
  syncStatus: 'Synced' | 'Pending Sync' | 'Local Only' | 'Failed';
  photoDataUrl?: string;
  internalNotes?: string[];
  auditTrail: AuditLog[];
  isDemoData?: boolean;
}

export interface DraftReport {
  id: string;
  category?: IncidentCategory;
  title?: string;
  description?: string;
  severity?: SeverityLevel;
  peopleAffected?: number;
  injuriesReported?: number;
  requiresMedical?: boolean;
  contactName?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  additionalLocation?: string;
  accuracyMeters?: number;
  photoDataUrl?: string;
  lastEdited: string;
  step: number;
}

export interface AssignmentRecord {
  id: string;
  incidentId: string;
  incidentTitle: string;
  assignedAt: string;
  status: 'Active' | 'Completed';
}

export interface RescueTeam {
  id: string;
  name: string;
  type: 'USAR' | 'Water Rescue' | 'Medical First Response' | 'Fire Suppression' | 'Logistics & Evac';
  status: 'Available' | 'Deployed' | 'Resting' | 'Offline';
  membersCount: number;
  leader: string;
  contact: string;
  capabilities: string[];
  serviceArea: string;
  currentIncidentId?: string;
  currentIncidentTitle?: string;
  assignmentHistory?: AssignmentRecord[];
  isDemoData?: boolean;
}

export type VolunteerSkill =
  | 'First Aid'
  | 'Medical Support'
  | 'Search & Rescue'
  | 'Fire Safety'
  | 'Transport'
  | 'Logistics'
  | 'Communications'
  | 'Shelter Support';

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email: string;
  skills: VolunteerSkill[];
  availability: 'Available' | 'Deployed' | 'Unavailable' | 'Off Duty';
  verified: boolean;
  currentAssignment?: string;
  joinedDate: string;
  lastActive: string;
  isDemoData?: boolean;
}

export type ResourceCategory =
  | 'Drinking Water'
  | 'Food'
  | 'Medicines'
  | 'First-Aid Kits'
  | 'Rescue Equipment'
  | 'Vehicles'
  | 'Temporary Shelters'
  | 'Blankets'
  | 'Communication Equipment';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  availableQty: number;
  requiredQty: number;
  unit: string;
  storageLocation: string;
  responsibleTeam: string;
  lastUpdated: string;
  expiryDate?: string;
}

export interface ResourceRequest {
  id: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  requestedQty: number;
  unit: string;
  requestedBy: string;
  incidentId?: string;
  priority: SeverityLevel;
  status: 'Pending' | 'Fulfilled';
  createdAt: string;
  fulfilledAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'assignment' | 'status' | 'resource' | 'sync';
  timestamp: string;
  read: boolean;
  linkId?: string;
}

export interface SyncQueueItem {
  id: string;
  idempotencyKey: string;
  entityType: 'incident' | 'status_update' | 'assignment' | 'resource_update';
  payload: unknown;
  timestamp: string;
  retryCount: number;
  status: 'Pending' | 'Failed';
  lastError?: string;
}
