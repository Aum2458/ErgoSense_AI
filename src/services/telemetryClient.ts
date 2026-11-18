import Pusher from 'pusher-js';

export interface LiveTelemetry {
  id: string;
  ergoScore: number;
  neckFlexion: number;
  shoulderTilt: number;
  torsoLean: number;
  deviceTilt: { pitch: number; roll: number };
  ambientLight: number;
  proximity: number;
  blinkRate: number;
  fatigueIndex: number;
  status: 'optimal' | 'attention' | 'severe';
  alertMessage: string;
  deviceId: string;
  timestamp: string;
}

export interface TrendBucket {
  label: string;
  ergoScore: number;
  neckFlexion: number;
  shoulderTilt: number;
  count: number;
  isToday?: boolean;
}

export interface TelemetryHistoryResponse {
  latest: LiveTelemetry;
  trend: TrendBucket[];
  records: LiveTelemetry[];
  source: 'mongodb' | 'local-cache';
}

export interface UserPreferences {
  displayName: string;
  email: string;
  dailyMovementGoalMins: number;
  eyeComfortIntervalMins: number;
  backgroundGuardian: boolean;
  baseline: {
    neckFlexion: number;
    shoulderTilt: number;
    torsoLean: number;
    calibratedAt: string | null;
  };
}

const PUSHER_KEY =
  import.meta.env.VITE_PUSHER_APP_KEY ||
  import.meta.env.VITE_PUSHER_KEY ||
  'a7b087c2dae686cf8e5a';
const PUSHER_CLUSTER =
  import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

const QUEUE_STORAGE_KEY = 'ergosense_offline_queue_v1';
const PREFS_STORAGE_KEY = 'ergosense_user_prefs_v1';

export const DEFAULT_TELEMETRY: LiveTelemetry = {
  id: 'init_live',
  ergoScore: 78,
  neckFlexion: 17.4,
  shoulderTilt: 2.1,
  torsoLean: 4.5,
  deviceTilt: { pitch: 14, roll: 3 },
  ambientLight: 64,
  proximity: 52,
  blinkRate: 18,
  fatigueIndex: 24,
  status: 'attention',
  alertMessage: '',
  deviceId: 'edge-client-01',
  timestamp: new Date().toISOString(),
};

export const DEFAULT_PREFS: UserPreferences = {
  displayName: 'Ergo User',
  email: 'ergo.user@ergosense.ai',
  dailyMovementGoalMins: 45,
  eyeComfortIntervalMins: 25,
  backgroundGuardian: true,
  baseline: {
    neckFlexion: 0,
    shoulderTilt: 0,
    torsoLean: 0,
    calibratedAt: null,
  },
};

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_PREFS;
}

export function saveUserPreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getQueuedRecords(): Partial<LiveTelemetry>[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // Seed 79 offline records initially as specified for Offline-First Local Persistence
  const seeded: Partial<LiveTelemetry>[] = Array.from({ length: 79 }, (_, idx) => ({
    ergoScore: 76 + (idx % 12),
    neckFlexion: Number((14 + (idx % 7) * 0.9).toFixed(1)),
    shoulderTilt: Number((1.1 + (idx % 4) * 0.5).toFixed(1)),
    torsoLean: Number((3.8 + (idx % 5) * 0.4).toFixed(1)),
    deviceTilt: { pitch: 14, roll: 3 },
    ambientLight: 60 + (idx % 15),
    proximity: 53,
    timestamp: new Date(Date.now() - (79 - idx) * 60000).toISOString(),
  }));
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

export function setQueuedRecords(records: Partial<LiveTelemetry>[]) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function clearAllLocalStorageData() {
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
    localStorage.removeItem(PREFS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function fetchTelemetryHistory(days: 1 | 7 | 30 = 7): Promise<TelemetryHistoryResponse> {
  const res = await fetch(`/api/telemetry?days=${days}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch telemetry history');
  return json.data;
}

export async function postTelemetryUpdate(payload: Partial<LiveTelemetry>): Promise<LiveTelemetry> {
  const res = await fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to post telemetry');
  return json.data;
}

export async function syncQueuedRecords(records: Partial<LiveTelemetry>[]): Promise<number> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Sync failed');
  return json.data?.syncedCount ?? records.length;
}

/**
 * Subscribes to Pusher `ergosense-channel` (`new-telemetry`) AND the local SSE fallback
 * so live telemetry works both with Pusher Cloud keys and zero-config locally.
 */
export function subscribeToErgoSenseChannel(
  onTelemetry: (data: LiveTelemetry) => void,
  onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void
) {
  let disposed = false;
  onStatusChange?.('connecting');

  let pusher: Pusher | null = null;
  let channel: any = null;

  if (PUSHER_KEY) {
    try {
      pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
      });
      channel = pusher.subscribe('ergosense-channel');
      channel.bind('new-telemetry', (data: LiveTelemetry) => {
        if (!disposed) onTelemetry(data);
      });
      pusher.connection.bind('connected', () => {
        if (!disposed) onStatusChange?.('connected');
      });
    } catch (err) {
      console.warn('[Pusher Client Warning]:', err);
    }
  }

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource('/api/stream');
    eventSource.addEventListener('connected', (e: MessageEvent) => {
      if (disposed) return;
      onStatusChange?.('connected');
      try {
        const parsed = JSON.parse(e.data);
        if (parsed?.latest) onTelemetry(parsed.latest);
      } catch {
        // ignore
      }
    });
    eventSource.addEventListener('new-telemetry', (e: MessageEvent) => {
      if (disposed) return;
      try {
        const parsed = JSON.parse(e.data);
        onTelemetry(parsed);
      } catch {
        // ignore
      }
    });
    eventSource.onerror = () => {
      if (!disposed) onStatusChange?.('disconnected');
    };
  } catch {
    // ignore
  }

  return () => {
    disposed = true;
    if (channel) {
      try {
        channel.unbind_all();
        pusher?.unsubscribe('ergosense-channel');
        pusher?.disconnect();
      } catch {
        // ignore
      }
    }
    if (eventSource) {
      eventSource.close();
    }
  };
}
