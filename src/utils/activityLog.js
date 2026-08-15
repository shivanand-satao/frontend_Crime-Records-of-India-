const STORAGE_KEY = "crime_records_activity_log";
const MAX_ITEMS = 60;

const readLog = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLog = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
};

export const recordActivity = (entry) => {
  const logEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const nextEntries = [logEntry, ...readLog()].slice(0, MAX_ITEMS);
  writeLog(nextEntries);
  return logEntry;
};

export const getActivityLog = () => readLog();

export const clearActivityLog = () => {
  localStorage.removeItem(STORAGE_KEY);
};