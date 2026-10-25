import {
  Incident,
  DraftReport,
  RescueTeam,
  Volunteer,
  ResourceItem,
  ResourceRequest,
  NotificationItem,
  SyncQueueItem
} from '../types';
import {
  initialIncidents,
  initialDrafts,
  initialTeams,
  initialVolunteers,
  initialResources,
  initialResourceRequests,
  initialNotifications
} from './seedData';

const DB_NAME = 'rescuegrid_offline_db';
const DB_VERSION = 2;

const STORES = [
  'incidents',
  'drafts',
  'teams',
  'volunteers',
  'resources',
  'resource_requests',
  'notifications',
  'sync_queue'
] as const;

class RescueDatabase {
  private dbPromise: Promise<IDBDatabase>;
  public ready: Promise<void>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    this.ready = this.initializeSeedData();
  }

  private async initializeSeedData(): Promise<void> {
    try {
      const existingIncidents = await this.getAll<Incident>('incidents');
      if (existingIncidents.length === 0) {
        await Promise.all([
          this.bulkPut('incidents', initialIncidents),
          this.bulkPut('drafts', initialDrafts),
          this.bulkPut('teams', initialTeams),
          this.bulkPut('volunteers', initialVolunteers),
          this.bulkPut('resources', initialResources),
          this.bulkPut('resource_requests', initialResourceRequests),
          this.bulkPut('notifications', initialNotifications)
        ]);
      }
    } catch (e) {
      console.error('Error seeding IndexedDB:', e);
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearStore(storeName: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async resetToSeed(): Promise<void> {
    for (const store of STORES) {
      await this.clearStore(store);
    }
    await Promise.all([
      this.bulkPut('incidents', initialIncidents),
      this.bulkPut('drafts', initialDrafts),
      this.bulkPut('teams', initialTeams),
      this.bulkPut('volunteers', initialVolunteers),
      this.bulkPut('resources', initialResources),
      this.bulkPut('resource_requests', initialResourceRequests),
      this.bulkPut('notifications', initialNotifications)
    ]);
  }
}

export const dbService = new RescueDatabase();
export type { SyncQueueItem };
