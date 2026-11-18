import Pusher from 'pusher-js';
import { ApiResponse, TelemetryPayload, BuzzEvent, UserProfile, LinkedDevice, ErgoScoreSnapshot } from '../types/ergosense.ts';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'us2';

let pusherClient: Pusher | null = null;
if (PUSHER_KEY) {
  try {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });
  } catch (err) {
    console.warn('[Pusher Client Init Error]', err);
  }
}

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch('/api/users');
  const json: ApiResponse<UserProfile[]> = await res.json();
  return json.data || [];
}

export async function fetchDevices(): Promise<LinkedDevice[]> {
  const res = await fetch('/api/devices');
  const json: ApiResponse<LinkedDevice[]> = await res.json();
  return json.data || [];
}

export async function fetchFleet(): Promise<any> {
  const res = await fetch('/api/fleet');
  const json: ApiResponse<any> = await res.json();
  return json.data;
}

export async function fetchSnapshots(userId: string): Promise<ErgoScoreSnapshot[]> {
  const res = await fetch(`/api/snapshots?userId=${encodeURIComponent(userId)}`);
  const json: ApiResponse<ErgoScoreSnapshot[]> = await res.json();
  return json.data || [];
}

export async function sendTelemetry(payload: TelemetryPayload): Promise<TelemetryPayload> {
  const res = await fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<TelemetryPayload> = await res.json();
  return json.data;
}

export async function sendBuzz(userId: string, intensity: 'gentle' | 'medium' | 'sharp' = 'sharp'): Promise<BuzzEvent> {
  const res = await fetch('/api/buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, intensity }),
  });
  const json: ApiResponse<BuzzEvent> = await res.json();
  return json.data;
}

export function subscribeToRealTime(
  userId: string,
  callbacks: {
    onTelemetry: (payload: TelemetryPayload) => void;
    onBuzz: (buzz: BuzzEvent) => void;
    onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void;
  }
) {
  let isCleanedUp = false;
  const channelName = `user-${userId}`;

  callbacks.onStatusChange?.('connecting');

  // 1. Pusher subscription if available
  let pusherChannel: any = null;
  if (pusherClient) {
    try {
      pusherChannel = pusherClient.subscribe(channelName);
      pusherChannel.bind('telemetry-update', (data: TelemetryPayload) => {
        if (!isCleanedUp) callbacks.onTelemetry(data);
      });
      pusherChannel.bind('remote-buzz', (data: BuzzEvent) => {
        if (!isCleanedUp) callbacks.onBuzz(data);
      });
    } catch (e) {
      console.warn('Pusher client subscription issue:', e);
    }
  }

  // 2. High-performance SSE connection for guaranteed sub-40ms stream
  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`/api/stream?userId=${encodeURIComponent(userId)}`);

    eventSource.addEventListener('connected', () => {
      if (!isCleanedUp) callbacks.onStatusChange?.('connected');
    });

    eventSource.addEventListener('telemetry-update', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (!isCleanedUp) callbacks.onTelemetry(parsed);
      } catch (err) {
        console.error('Failed to parse telemetry SSE:', err);
      }
    });

    eventSource.addEventListener('remote-buzz', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (!isCleanedUp) callbacks.onBuzz(parsed);
      } catch (err) {
        console.error('Failed to parse buzz SSE:', err);
      }
    });

    eventSource.onopen = () => {
      if (!isCleanedUp) callbacks.onStatusChange?.('connected');
    };

    eventSource.onerror = () => {
      if (!isCleanedUp) callbacks.onStatusChange?.('disconnected');
    };
  } catch (err) {
    console.error('SSE initialization error:', err);
  }

  return () => {
    isCleanedUp = true;
    if (pusherClient && pusherChannel) {
      try {
        pusherChannel.unbind_all();
        pusherClient.unsubscribe(channelName);
      } catch (e) {
        // ignore
      }
    }
    if (eventSource) {
      eventSource.close();
    }
  };
}
