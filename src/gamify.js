import { syncProgress } from './lms-api.js';

const DB_NAME = 'saim_gamify_v2';
const STORE_NAME = 'progress';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function load() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('state');
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const data = request.result || { points: 0, missions: [] };
        resolve({
          points: typeof data.points === 'number' ? data.points : 0,
          missions: Array.isArray(data.missions) ? data.missions : [],
        });
      };
      request.onerror = () => resolve({ points: 0, missions: [] });
    });
  } catch {
    return { points: 0, missions: [] };
  }
}

async function save(state) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(state, 'state');
    // Sync with LMS
    await syncProgress(state);
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export function getGamifyState() {
  return load();
}

export function addPoints(amount) {
  const s = load();
  s.points += amount;
  save(s);
  return s;
}

export function completeMission(missionId) {
  const s = load();
  if (!s.missions.includes(missionId)) {
    s.missions.push(missionId);
    save(s);
  }
  return s;
}

export function isMissionDone(missionId) {
  return load().missions.includes(missionId);
}

export function resetProgress() {
  save({ points: 0, missions: [] });
}
