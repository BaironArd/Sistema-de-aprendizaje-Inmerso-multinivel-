const STORAGE_KEY = 'saim_gamify_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { points: 0, missions: [] };
    const data = JSON.parse(raw);
    return {
      points: typeof data.points === 'number' ? data.points : 0,
      missions: Array.isArray(data.missions) ? data.missions : [],
    };
  } catch {
    return { points: 0, missions: [] };
  }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
