import { Incident, RescueTeam, Volunteer, ResourceItem, ResourceRequest, DraftReport, NotificationItem } from '../types';

export const initialIncidents: Incident[] = [
  {
    id: 'INC-2026-8812',
    category: 'Flood',
    title: 'Severe Flash Flooding & Stranded Civilians',
    description: 'River breached retaining wall near Sector 4. Over 18 individuals stranded on residential rooftops with rising water levels.',
    severity: 'Critical',
    verification: 'Verified',
    status: 'In Progress',
    location: {
      address: 'Sector 4, Lowlands Promenade, Riverside',
      latitude: 28.6139,
      longitude: 77.2090,
      accuracyMeters: 6,
      details: 'Building 14-B, yellow terrace with solar panels'
    },
    peopleAffected: 28,
    injuriesReported: 3,
    requiresMedical: true,
    contactName: 'Officer K. Raman (DEMO)',
    contactPhone: '+91 98765 00101',
    assignedTeamId: 'TEAM-01',
    assignedTeamName: 'Alpha Swiftwater Specialists',
    assignedVolunteerIds: ['VOL-01', 'VOL-04'],
    reportedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    syncStatus: 'Synced',
    isDemoData: true,
    internalNotes: [
      'Aerial drone pass confirmed 18 people on Building 14-B terrace.',
      'Inflatable boat unit launched from North Pier.'
    ],
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(), actor: 'Field Dispatcher', action: 'Report Logged (New)' },
      { id: '2', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), actor: 'Coord. Anita Rao', action: 'Verification updated to Verified after aerial assessment' },
      { id: '3', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), actor: 'Coord. Anita Rao', action: 'Assigned to Alpha Swiftwater Specialists' },
      { id: '4', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), actor: 'Alpha Lead', action: 'Status transitioned from Assigned to In Progress' }
    ]
  },
  {
    id: 'INC-2026-8815',
    category: 'Structural Collapse',
    title: 'Multi-Storey Commercial Annex Partial Cave-in',
    description: 'Foundation weakness triggered 2-floor facade collapse. At least 5 persons reported trapped beneath secondary awning debris.',
    severity: 'Critical',
    verification: 'Verified',
    status: 'Assigned',
    location: {
      address: '74 Metro Cross Road, Industrial Zone East',
      latitude: 28.6328,
      longitude: 77.2197,
      accuracyMeters: 12,
      details: 'Old textile warehouse rear wing'
    },
    peopleAffected: 15,
    injuriesReported: 5,
    requiresMedical: true,
    contactName: 'Security Desk (DEMO)',
    contactPhone: '+91 91234 00202',
    assignedTeamId: 'TEAM-02',
    assignedTeamName: 'Bravo Urban Search & Rescue (USAR)',
    assignedVolunteerIds: ['VOL-02'],
    reportedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    syncStatus: 'Synced',
    isDemoData: true,
    internalNotes: ['Gas mains shut off by municipal utility crew.'],
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), actor: 'Public Hotline', action: 'Report Logged' },
      { id: '2', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), actor: 'Inspector Paul', action: 'Site verified as structurally compromised' },
      { id: '3', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), actor: 'Dispatch HQ', action: 'Assigned Bravo USAR (Acoustic sensors en route)' }
    ]
  },
  {
    id: 'INC-2026-8820',
    category: 'Urban Fire',
    title: 'Commercial Complex Electrical Fire with Smoke Plume',
    description: 'Basement transformer fault with dense smoke spreading into third-floor outpatient clinic.',
    severity: 'High',
    verification: 'Verified',
    status: 'In Progress',
    location: {
      address: 'Civic Centre Arcade, Ring Road Plaza',
      latitude: 28.5800,
      longitude: 77.2400,
      accuracyMeters: 8,
      details: 'East staircase pressurized; use West service ramp'
    },
    peopleAffected: 42,
    injuriesReported: 7,
    requiresMedical: true,
    contactName: 'Facility Manager (DEMO)',
    contactPhone: '+91 99887 00303',
    assignedTeamId: 'TEAM-04',
    assignedTeamName: 'Delta Fire & Hazmat Unit',
    assignedVolunteerIds: ['VOL-03'],
    reportedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    syncStatus: 'Synced',
    isDemoData: true,
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(), actor: 'System Operator', action: 'Incident created from emergency phone call' },
      { id: '2', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), actor: 'Dispatch HQ', action: 'Delta Fire & Hazmat Unit dispatched' }
    ]
  },
  {
    id: 'INC-2026-8824',
    category: 'Landslide',
    title: 'Hillside Mudslide Blocking Arterial Bypass Road',
    description: 'Heavy overnight precipitation induced soil shift blocking transit route with 2 commuter vans stranded between earth mounds.',
    severity: 'High',
    verification: 'Pending',
    status: 'Pending Review',
    location: {
      address: 'North Ridge Bypass Km 14',
      latitude: 28.6600,
      longitude: 77.1800,
      accuracyMeters: 25
    },
    peopleAffected: 8,
    injuriesReported: 1,
    requiresMedical: false,
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignedVolunteerIds: [],
    syncStatus: 'Synced',
    isDemoData: true,
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), actor: 'Citizen Web Portal', action: 'Initial public report logged (Pending verification)' }
    ]
  },
  {
    id: 'INC-2026-8830',
    category: 'Missing Person',
    title: 'Two Children Separated During Flood Evacuation',
    description: 'Ages 7 and 9 last seen near Relief Center Gate 3 wearing yellow and blue rain slickers.',
    severity: 'Medium',
    verification: 'Verified',
    status: 'New',
    location: {
      address: 'Community Center Camp 3, West Ring',
      latitude: 28.6010,
      longitude: 77.1650,
      accuracyMeters: 10
    },
    peopleAffected: 2,
    injuriesReported: 0,
    requiresMedical: false,
    contactName: 'Camp Intake Desk (DEMO)',
    contactPhone: '+91 97711 00404',
    reportedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    assignedVolunteerIds: [],
    syncStatus: 'Synced',
    isDemoData: true,
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), actor: 'Volunteer Desk', action: 'Report logged from camp intake' }
    ]
  },
  {
    id: 'INC-2026-8833',
    category: 'Road Accident',
    title: 'Multi-Vehicle Collision on Elevated Expressway',
    description: 'Low visibility during rainstorm caused 3-vehicle collision blocking southbound lanes. Fuel spill reported on wet asphalt.',
    severity: 'Critical',
    verification: 'Pending',
    status: 'New',
    location: {
      address: 'Elevated Expressway Pillar 88, Southbound',
      latitude: 28.5920,
      longitude: 77.2280,
      accuracyMeters: 15,
      details: '200m before Exit 4 ramp'
    },
    peopleAffected: 6,
    injuriesReported: 4,
    requiresMedical: true,
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    assignedVolunteerIds: [],
    syncStatus: 'Synced',
    isDemoData: true,
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), actor: 'Highway Patrol Feed', action: 'Critical incident reported — awaiting coordinator verification' }
    ]
  },
  {
    id: 'INC-2026-8801',
    category: 'Medical Emergency',
    title: 'Clinic Backup Oxygen Supply Depletion',
    description: 'Substation outage depleted clinic backup battery. Portable oxygen concentrators and generator fuel delivered.',
    severity: 'Critical',
    verification: 'Verified',
    status: 'Resolved',
    location: {
      address: 'Green Haven Community Clinic, Sector 12',
      latitude: 28.5600,
      longitude: 77.2100,
      accuracyMeters: 4
    },
    peopleAffected: 4,
    injuriesReported: 0,
    requiresMedical: true,
    contactName: 'Duty Physician (DEMO)',
    contactPhone: '+91 98450 00505',
    assignedTeamId: 'TEAM-03',
    assignedTeamName: 'Echo Rapid Paramedics',
    assignedVolunteerIds: ['VOL-01'],
    reportedAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    syncStatus: 'Synced',
    isDemoData: true,
    auditTrail: [
      { id: '1', timestamp: new Date(Date.now() - 320 * 60 * 1000).toISOString(), actor: 'Dispatch HQ', action: 'Report logged' },
      { id: '2', timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(), actor: 'Echo Lead', action: 'Portable oxygen units dispatched' },
      { id: '3', timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), actor: 'Echo Lead', action: 'Status transitioned to Resolved' }
    ]
  }
];

export const initialDrafts: DraftReport[] = [
  {
    id: 'DRAFT-1042',
    category: 'Flood',
    title: 'Submerged Underpass & Stalled School Bus',
    description: 'Water level approximately 1.2 meters near railway underpass. All passengers evacuated to high ground; vehicle recovery needed.',
    severity: 'Medium',
    peopleAffected: 12,
    injuriesReported: 0,
    requiresMedical: false,
    address: 'Old Railway Underpass, West Crossing',
    additionalLocation: 'North side embankment',
    latitude: 28.6215,
    longitude: 77.1945,
    accuracyMeters: 14,
    contactName: 'Transit Supervisor (DEMO)',
    contactPhone: '+91 98000 11223',
    lastEdited: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    step: 3
  }
];

export const initialTeams: RescueTeam[] = [
  {
    id: 'TEAM-01',
    name: 'Alpha Swiftwater Specialists',
    type: 'Water Rescue',
    status: 'Deployed',
    membersCount: 8,
    leader: 'Capt. M. Singh (DEMO)',
    contact: 'Channel 4A / +91-11-2300-0101',
    capabilities: ['Inflatable Zodiacs', 'Swiftwater Swimmers', 'Drone Recon', 'Line Throwers'],
    serviceArea: 'Riverside & Northern Canals',
    currentIncidentId: 'INC-2026-8812',
    currentIncidentTitle: 'Severe Flash Flooding & Stranded Civilians',
    isDemoData: true,
    assignmentHistory: [
      {
        id: 'ASG-01',
        incidentId: 'INC-2026-8812',
        incidentTitle: 'Severe Flash Flooding & Stranded Civilians',
        assignedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ]
  },
  {
    id: 'TEAM-02',
    name: 'Bravo Urban Search & Rescue (USAR)',
    type: 'USAR',
    status: 'Deployed',
    membersCount: 12,
    leader: 'Maj. V. Malhotra (DEMO)',
    contact: 'Channel 2B / +91-11-2300-0102',
    capabilities: ['Acoustic Listening', 'Canine Search', 'Hydraulic Cutters', 'Structural Shoring'],
    serviceArea: 'Central Metro & Industrial Sectors',
    currentIncidentId: 'INC-2026-8815',
    currentIncidentTitle: 'Multi-Storey Commercial Annex Partial Cave-in',
    isDemoData: true,
    assignmentHistory: [
      {
        id: 'ASG-02',
        incidentId: 'INC-2026-8815',
        incidentTitle: 'Multi-Storey Commercial Annex Partial Cave-in',
        assignedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ]
  },
  {
    id: 'TEAM-03',
    name: 'Echo Rapid Paramedics',
    type: 'Medical First Response',
    status: 'Available',
    membersCount: 6,
    leader: 'Dr. F. Qureshi (DEMO)',
    contact: 'Channel 1M / +91-11-2300-0103',
    capabilities: ['Advanced Trauma Life Support', 'Field Oxygen Concentrators', 'Triage Tent', 'Defibrillators'],
    serviceArea: 'City-wide High Priority',
    isDemoData: true,
    assignmentHistory: [
      {
        id: 'ASG-03',
        incidentId: 'INC-2026-8801',
        incidentTitle: 'Clinic Backup Oxygen Supply Depletion',
        assignedAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
        status: 'Completed'
      }
    ]
  },
  {
    id: 'TEAM-04',
    name: 'Delta Fire & Hazmat Unit',
    type: 'Fire Suppression',
    status: 'Deployed',
    membersCount: 10,
    leader: 'Station Officer R. Sen (DEMO)',
    contact: 'Channel 6F / +91-11-2300-0104',
    capabilities: ['Thermal Imaging', 'Breathing Apparatus', 'Class B Foam', 'Turntable Ladder'],
    serviceArea: 'Industrial Zone & Civic Hub',
    currentIncidentId: 'INC-2026-8820',
    currentIncidentTitle: 'Commercial Complex Electrical Fire with Smoke Plume',
    isDemoData: true,
    assignmentHistory: [
      {
        id: 'ASG-04',
        incidentId: 'INC-2026-8820',
        incidentTitle: 'Commercial Complex Electrical Fire with Smoke Plume',
        assignedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ]
  },
  {
    id: 'TEAM-05',
    name: 'Sierra Relief & Evacuation Taskforce',
    type: 'Logistics & Evac',
    status: 'Available',
    membersCount: 14,
    leader: 'Coord. J. Bindra (DEMO)',
    contact: 'Channel 8L / +91-11-2300-0105',
    capabilities: ['High-Clearance 4x4 Trucks', 'Emergency Shelter Setup', 'VHF Repeater', 'Mass Rations'],
    serviceArea: 'Outer Periphery & Hill Corridors',
    isDemoData: true,
    assignmentHistory: []
  }
];

export const initialVolunteers: Volunteer[] = [
  {
    id: 'VOL-01',
    name: 'Aakash Patel (DEMO)',
    phone: '+91 98765 11111',
    email: 'aakash.p@demo.rescuegrid.org',
    skills: ['First Aid', 'Medical Support', 'Transport'],
    availability: 'Deployed',
    verified: true,
    currentAssignment: 'INC-2026-8812 (Alpha Swiftwater Support)',
    joinedDate: '2025-08-14',
    lastActive: '10 mins ago',
    isDemoData: true
  },
  {
    id: 'VOL-02',
    name: 'Priyanka Sen (DEMO)',
    phone: '+91 98765 22222',
    email: 'p.sen@demo.rescuegrid.org',
    skills: ['Search & Rescue', 'Logistics'],
    availability: 'Deployed',
    verified: true,
    currentAssignment: 'INC-2026-8815 (Bravo USAR Perimeter)',
    joinedDate: '2025-11-02',
    lastActive: '25 mins ago',
    isDemoData: true
  },
  {
    id: 'VOL-03',
    name: 'Rohit Deshmukh (DEMO)',
    phone: '+91 98765 33333',
    email: 'rohit.d@demo.rescuegrid.org',
    skills: ['Fire Safety', 'First Aid'],
    availability: 'Deployed',
    verified: true,
    currentAssignment: 'INC-2026-8820 (Delta Hazmat Cordon)',
    joinedDate: '2026-01-20',
    lastActive: '5 mins ago',
    isDemoData: true
  },
  {
    id: 'VOL-04',
    name: 'Zoya Khan (DEMO)',
    phone: '+91 98765 44444',
    email: 'zoya.k@demo.rescuegrid.org',
    skills: ['Communications', 'Shelter Support'],
    availability: 'Available',
    verified: true,
    joinedDate: '2025-04-18',
    lastActive: '18 mins ago',
    isDemoData: true
  },
  {
    id: 'VOL-05',
    name: 'Naveen Swamy (DEMO)',
    phone: '+91 98765 55555',
    email: 'naveen.s@demo.rescuegrid.org',
    skills: ['Transport', 'Logistics'],
    availability: 'Available',
    verified: false,
    joinedDate: '2026-03-01',
    lastActive: '1 hr ago',
    isDemoData: true
  },
  {
    id: 'VOL-06',
    name: 'Ananya Mukherjee (DEMO)',
    phone: '+91 98765 66666',
    email: 'ananya.m@demo.rescuegrid.org',
    skills: ['Medical Support', 'Shelter Support'],
    availability: 'Off Duty',
    verified: true,
    joinedDate: '2024-12-10',
    lastActive: '4 hrs ago',
    isDemoData: true
  },
  {
    id: 'VOL-07',
    name: 'Kabir Gill (DEMO)',
    phone: '+91 98765 77777',
    email: 'kabir.g@demo.rescuegrid.org',
    skills: ['Search & Rescue', 'Communications'],
    availability: 'Unavailable',
    verified: false,
    joinedDate: '2026-02-11',
    lastActive: 'Yesterday',
    isDemoData: true
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: 'RES-01',
    name: 'Packaged Drinking Water (20L Jerrycans)',
    category: 'Drinking Water',
    availableQty: 480,
    requiredQty: 1000,
    unit: 'Cans',
    storageLocation: 'Depot North Hub B',
    responsibleTeam: 'Sierra Relief & Evacuation Taskforce',
    lastUpdated: '15 mins ago',
    expiryDate: '2027-06-30'
  },
  {
    id: 'RES-02',
    name: 'High-Calorie Emergency Rations (MRE)',
    category: 'Food',
    availableQty: 1250,
    requiredQty: 2000,
    unit: 'Packs',
    storageLocation: 'Central Civic Warehouse',
    responsibleTeam: 'Sierra Relief & Evacuation Taskforce',
    lastUpdated: '45 mins ago',
    expiryDate: '2026-11-10'
  },
  {
    id: 'RES-03',
    name: 'Broad-Spectrum Antibiotics & IV Fluids',
    category: 'Medicines',
    availableQty: 85,
    requiredQty: 300,
    unit: 'Boxes',
    storageLocation: 'Medical Cold Chain Depot',
    responsibleTeam: 'Echo Rapid Paramedics',
    lastUpdated: '20 mins ago',
    expiryDate: '2026-10-30'
  },
  {
    id: 'RES-04',
    name: 'Field Trauma & Hemorrhage First-Aid Kits',
    category: 'First-Aid Kits',
    availableQty: 42,
    requiredQty: 150,
    unit: 'Kits',
    storageLocation: 'Hospital Base Depot',
    responsibleTeam: 'Echo Rapid Paramedics',
    lastUpdated: '30 mins ago',
    expiryDate: '2027-03-15'
  },
  {
    id: 'RES-05',
    name: 'Inflatable Rescue Boats & Life Vests',
    category: 'Rescue Equipment',
    availableQty: 9,
    requiredQty: 12,
    unit: 'Sets',
    storageLocation: 'Riverside Station 4',
    responsibleTeam: 'Alpha Swiftwater Specialists',
    lastUpdated: '1 hr ago'
  },
  {
    id: 'RES-06',
    name: 'High-Clearance 4x4 Evacuation Trucks',
    category: 'Vehicles',
    availableQty: 6,
    requiredQty: 10,
    unit: 'Vehicles',
    storageLocation: 'Municipal Motor Pool',
    responsibleTeam: 'Sierra Relief & Evacuation Taskforce',
    lastUpdated: '2 hrs ago'
  },
  {
    id: 'RES-07',
    name: 'All-Weather Family Relief Tents',
    category: 'Temporary Shelters',
    availableQty: 95,
    requiredQty: 300,
    unit: 'Tents',
    storageLocation: 'West Transit Shelter Compound',
    responsibleTeam: 'Sierra Relief & Evacuation Taskforce',
    lastUpdated: '3 hrs ago'
  },
  {
    id: 'RES-08',
    name: 'Thermal Wool & Foil Emergency Blankets',
    category: 'Blankets',
    availableQty: 640,
    requiredQty: 800,
    unit: 'Blankets',
    storageLocation: 'Central Civic Warehouse',
    responsibleTeam: 'Sierra Relief & Evacuation Taskforce',
    lastUpdated: '1 hr ago'
  },
  {
    id: 'RES-09',
    name: 'Dual-Band Waterproof VHF Handsets',
    category: 'Communication Equipment',
    availableQty: 24,
    requiredQty: 30,
    unit: 'Radios',
    storageLocation: 'Command Radio Ops Room',
    responsibleTeam: 'Bravo Urban Search & Rescue (USAR)',
    lastUpdated: '10 mins ago'
  }
];

export const initialResourceRequests: ResourceRequest[] = [
  {
    id: 'REQ-901',
    resourceId: 'RES-01',
    resourceName: 'Packaged Drinking Water (20L Jerrycans)',
    category: 'Drinking Water',
    requestedQty: 150,
    unit: 'Cans',
    requestedBy: 'Camp 3 Relief Coordinator',
    incidentId: 'INC-2026-8812',
    priority: 'High',
    status: 'Pending',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'REQ-902',
    resourceId: 'RES-04',
    resourceName: 'Field Trauma & Hemorrhage First-Aid Kits',
    category: 'First-Aid Kits',
    requestedQty: 25,
    unit: 'Kits',
    requestedBy: 'Bravo USAR Medical Officer',
    incidentId: 'INC-2026-8815',
    priority: 'Critical',
    status: 'Pending',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-101',
    title: 'Critical Incident Logged (DEMO)',
    message: 'INC-2026-8833: Multi-Vehicle Collision on Elevated Expressway awaiting verification.',
    type: 'critical',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    read: false,
    linkId: 'INC-2026-8833'
  },
  {
    id: 'NOTIF-102',
    title: 'Critical Stock Shortage Alert',
    message: 'Medicines (Broad-Spectrum Antibiotics) below 30% of required threshold at Medical Cold Chain Depot.',
    type: 'resource',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'NOTIF-103',
    title: 'Rescue Team Dispatched (DEMO)',
    message: 'Alpha Swiftwater Specialists assigned to INC-2026-8812 (Sector 4 Flash Flooding).',
    type: 'assignment',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: true,
    linkId: 'INC-2026-8812'
  }
];
