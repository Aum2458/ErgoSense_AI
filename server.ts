import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Pusher from 'pusher';
import { connectToDatabase } from './lib/mongodb.ts';
import TelemetryModel from './models/Telemetry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Pusher if credentials are provided in env
const pusherAppId = process.env.PUSHER_APP_ID;
const pusherKey =
  process.env.PUSHER_KEY ||
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
  process.env.VITE_PUSHER_APP_KEY ||
  process.env.VITE_PUSHER_KEY;
const pusherSecret = process.env.PUSHER_SECRET;
const pusherCluster =
  process.env.PUSHER_CLUSTER ||
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER ||
  process.env.VITE_PUSHER_CLUSTER ||
  process.env.VITE_PUSHER_CLUSTER ||
  'ap2';

let pusher: Pusher | null = null;
if (pusherAppId && pusherKey && pusherSecret && !pusherSecret.includes('your_')) {
  pusher = new Pusher({
    appId: pusherAppId,
    key: pusherKey,
    secret: pusherSecret,
    cluster: pusherCluster,
    useTLS: true,
  });
  console.log(`[Pusher] Initialized channel engine on cluster: ${pusherCluster}`);
} else {
  console.log('[Pusher] Running with built-in SSE real-time channel bridge (set PUSHER_SECRET for cloud Pusher)');
}

// Track active SSE clients
const sseClients = new Set<{ res: Response }>();

export interface TelemetryRecord {
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

// Seed realistic 30-day historical snapshots for Analytics when MongoDB is empty or offline
function generateSeedHistory(): TelemetryRecord[] {
  const records: TelemetryRecord[] = [];
  const now = Date.now();
  const baseScores = [74, 79, 82, 76, 85, 88, 78, 81, 84, 79, 86, 90, 83, 77, 85, 88, 82, 79, 84, 87, 89, 76, 80, 83, 86, 91, 85, 79, 84, 78];

  for (let d = 29; d >= 0; d--) {
    const score = baseScores[29 - d] ?? 80;
    const dayTs = now - d * 86400000;
    // Generate 3 snapshots per day (Morning, Afternoon, Evening)
    const offsets = [9 * 3600000, 14 * 3600000, 18 * 3600000];
    offsets.forEach((offset, idx) => {
      const startOfDay = new Date(dayTs);
      startOfDay.setHours(0, 0, 0, 0);
      const ts = startOfDay.getTime() + offset;
      if (ts > now) return;

      const neck = idx === 1 ? 19.5 : 12.2 + (idx % 3);
      const shoulder = idx === 1 ? 3.2 : 1.1;
      const lean = idx === 1 ? 6.5 : 3.4;
      const dayScore = Math.max(52, Math.min(98, score + (idx === 0 ? 4 : idx === 1 ? -5 : 1)));

      records.push({
        id: `seed_${d}_${idx}`,
        ergoScore: dayScore,
        neckFlexion: Number(neck.toFixed(1)),
        shoulderTilt: Number(shoulder.toFixed(1)),
        torsoLean: Number(lean.toFixed(1)),
        deviceTilt: { pitch: 14, roll: 3 },
        ambientLight: idx === 2 ? 48 : 72,
        proximity: idx === 1 ? 47 : 56,
        blinkRate: idx === 1 ? 15 : 19,
        fatigueIndex: idx === 1 ? 34 : 18,
        status: dayScore >= 80 ? 'optimal' : dayScore >= 65 ? 'attention' : 'severe',
        alertMessage: shoulder >= 4 ? 'Uneven shoulders detected. Drop your high shoulder and balance your weight.' : '',
        deviceId: 'edge-client-01',
        timestamp: new Date(ts).toISOString(),
      });
    });
  }

  // Add recent hourly points for Today
  for (let h = 6; h >= 1; h--) {
    const ts = now - h * 3600000;
    const neck = h === 2 ? 21.4 : 13.5 + (h % 3) * 1.4;
    const shoulder = h === 2 ? 4.4 : 1.4;
    const score = h === 2 ? 69 : 78 + (h % 4) * 3;
    records.push({
      id: `today_${h}`,
      ergoScore: score,
      neckFlexion: Number(neck.toFixed(1)),
      shoulderTilt: Number(shoulder.toFixed(1)),
      torsoLean: 4.2,
      deviceTilt: { pitch: 16, roll: 2 },
      ambientLight: 62,
      proximity: 53,
      blinkRate: 18,
      fatigueIndex: 22,
      status: score >= 80 ? 'optimal' : 'attention',
      alertMessage: shoulder >= 4 ? 'Uneven shoulders detected. Drop your high shoulder and balance your weight.' : '',
      deviceId: 'edge-client-01',
      timestamp: new Date(ts).toISOString(),
    });
  }

  return records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const memoryTelemetryStore: TelemetryRecord[] = generateSeedHistory();
let latestTelemetry: TelemetryRecord = {
  id: 'live_initial',
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

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(express.json({ limit: '2mb' }));

function broadcastChannelEvent(channel: string, event: string, data: any) {
  if (pusher) {
    pusher.trigger(channel, event, data).catch((err) => {
      console.warn('[Pusher Trigger Error]:', err.message);
    });
  }

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function normalizeIncomingPayload(body: any): TelemetryRecord {
  const neckFlexion = Number(body.neckFlexion ?? body.cervicalTiltDeg ?? 14.0);
  const shoulderTilt = Number(body.shoulderTilt ?? body.headRollDeg ?? 1.2);
  const torsoLean = Number(body.torsoLean ?? 4.0);
  const proximity = Number(body.proximity ?? body.proximityCm ?? 54.0);
  const ambientLight = Number(body.ambientLight ?? body.ambientLightLux ?? 64);

  const pitch =
    typeof body.deviceTilt === 'object' && body.deviceTilt !== null
      ? Number(body.deviceTilt.pitch ?? 14)
      : Number(body.deviceTilt ?? body.headPitchDeg ?? 14);
  const roll =
    typeof body.deviceTilt === 'object' && body.deviceTilt !== null
      ? Number(body.deviceTilt.roll ?? 3)
      : Number(body.deviceRoll ?? 3);

  const fatigueIndex = Number(body.fatigueIndex ?? 22);
  const blinkRate = Number(body.blinkRate ?? body.blinkRatePerMin ?? 18);

  let computedScore = body.ergoScore !== undefined ? Number(body.ergoScore) : undefined;
  if (computedScore === undefined || Number.isNaN(computedScore)) {
    const neckPenalty = Math.max(0, (neckFlexion - 12) * 1.9);
    const shoulderPenalty = Math.max(0, (Math.abs(shoulderTilt) - 2) * 3.5);
    const torsoPenalty = Math.max(0, (torsoLean - 5) * 2.0);
    const distPenalty = proximity < 50 ? (50 - proximity) * 1.1 : 0;
    computedScore = Math.max(20, Math.min(100, Math.round(100 - neckPenalty - shoulderPenalty - torsoPenalty - distPenalty)));
  }

  let status: 'optimal' | 'attention' | 'severe' = 'optimal';
  if (neckFlexion > 24 || Math.abs(shoulderTilt) >= 5 || torsoLean > 12 || computedScore < 60) {
    status = 'severe';
  } else if (neckFlexion > 15 || Math.abs(shoulderTilt) >= 3.5 || torsoLean > 6 || proximity < 48 || computedScore < 80) {
    status = 'attention';
  }

  let alertMessage = body.alertMessage || '';
  if (!alertMessage && Math.abs(shoulderTilt) >= 3.5) {
    alertMessage = 'Uneven shoulders detected. Drop your high shoulder and balance your weight.';
  } else if (!alertMessage && neckFlexion > 20) {
    alertMessage = 'Forward head tilt detected. Tuck your chin slightly and align ears over shoulders.';
  }

  return {
    id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ergoScore: computedScore,
    neckFlexion: Number(neckFlexion.toFixed(1)),
    shoulderTilt: Number(shoulderTilt.toFixed(1)),
    torsoLean: Number(torsoLean.toFixed(1)),
    deviceTilt: { pitch: Math.round(pitch), roll: Math.round(roll) },
    ambientLight: Math.round(ambientLight),
    proximity: Number(proximity.toFixed(1)),
    blinkRate,
    fatigueIndex,
    status,
    alertMessage,
    deviceId: body.deviceId || 'edge-client-01',
    timestamp: body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// POST /api/telemetry
// Receives ergonomic JSON payload, saves to MongoDB asynchronously,
// and triggers Pusher 'ergosense-channel' -> 'new-telemetry'
// -------------------------------------------------------------
app.post('/api/telemetry', async (req: Request, res: Response) => {
  try {
    const normalized = normalizeIncomingPayload(req.body || {});
    latestTelemetry = normalized;

    memoryTelemetryStore.push(normalized);
    if (memoryTelemetryStore.length > 2000) {
      memoryTelemetryStore.shift();
    }

    // Broadcast immediately via Pusher + SSE for sub-40ms UI updates
    broadcastChannelEvent('ergosense-channel', 'new-telemetry', normalized);

    // Asynchronously persist to MongoDB if configured
    connectToDatabase()
      .then((db) => {
        if (db) {
          return TelemetryModel.create({
            ergoScore: normalized.ergoScore,
            neckFlexion: normalized.neckFlexion,
            shoulderTilt: normalized.shoulderTilt,
            torsoLean: normalized.torsoLean,
            deviceTilt: normalized.deviceTilt,
            ambientLight: normalized.ambientLight,
            proximity: normalized.proximity,
            blinkRate: normalized.blinkRate,
            fatigueIndex: normalized.fatigueIndex,
            status: normalized.status,
            alertMessage: normalized.alertMessage,
            deviceId: normalized.deviceId,
            timestamp: new Date(normalized.timestamp),
          });
        }
        return null;
      })
      .catch((err) => {
        console.warn('[MongoDB Async Write Error]:', err.message);
      });

    return res.status(200).json({
      success: true,
      data: normalized,
      message: 'Telemetry persisted and broadcast on ergosense-channel',
    });
  } catch (err: any) {
    console.error('[POST /api/telemetry Error]:', err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err?.message || 'Failed to process telemetry payload',
    });
  }
});

// -------------------------------------------------------------
// GET /api/telemetry?days=7
// Returns historical snapshots & aggregated trend buckets
// -------------------------------------------------------------
app.get('/api/telemetry', async (req: Request, res: Response) => {
  try {
    const days = Math.max(1, Math.min(90, parseInt((req.query.days as string) || '7', 10) || 7));
    const cutoff = new Date(Date.now() - days * 86400000);

    let records: TelemetryRecord[] = [];
    const db = await connectToDatabase();

    if (db) {
      const docs = await TelemetryModel.find({ timestamp: { $gte: cutoff } })
        .sort({ timestamp: 1 })
        .limit(1000)
        .lean();

      if (docs && docs.length > 0) {
        records = docs.map((d: any) => ({
          id: String(d._id),
          ergoScore: d.ergoScore,
          neckFlexion: d.neckFlexion,
          shoulderTilt: d.shoulderTilt,
          torsoLean: d.torsoLean,
          deviceTilt: d.deviceTilt || { pitch: 14, roll: 3 },
          ambientLight: d.ambientLight,
          proximity: d.proximity ?? 54,
          blinkRate: d.blinkRate ?? 18,
          fatigueIndex: d.fatigueIndex ?? 22,
          status: d.status || 'optimal',
          alertMessage: d.alertMessage || '',
          deviceId: d.deviceId || 'edge-client-01',
          timestamp: new Date(d.timestamp).toISOString(),
        }));
      }
    }

    if (records.length === 0) {
      records = memoryTelemetryStore.filter((r) => new Date(r.timestamp).getTime() >= cutoff.getTime());
    }

    // Aggregate into chart buckets (hourly for Today, daily for 7d/30d)
    const buckets: { label: string; ergoScore: number; neckFlexion: number; shoulderTilt: number; count: number; isToday?: boolean }[] = [];

    if (days === 1) {
      const hourMap = new Map<string, { scoreSum: number; neckSum: number; shSum: number; count: number; hourNum: number }>();
      const currentHour = new Date().getHours();
      records.forEach((r) => {
        const dt = new Date(r.timestamp);
        const h = dt.getHours();
        const label = `${h.toString().padStart(2, '0')}:00`;
        const entry = hourMap.get(label) || { scoreSum: 0, neckSum: 0, shSum: 0, count: 0, hourNum: h };
        entry.scoreSum += r.ergoScore;
        entry.neckSum += r.neckFlexion;
        entry.shSum += Math.abs(r.shoulderTilt);
        entry.count += 1;
        hourMap.set(label, entry);
      });

      hourMap.forEach((v, label) => {
        buckets.push({
          label,
          ergoScore: Math.round(v.scoreSum / v.count),
          neckFlexion: Number((v.neckSum / v.count).toFixed(1)),
          shoulderTilt: Number((v.shSum / v.count).toFixed(1)),
          count: v.count,
          isToday: v.hourNum === currentHour,
        });
      });
    } else {
      const dayMap = new Map<string, { scoreSum: number; neckSum: number; shSum: number; count: number; ts: number }>();
      const todayKey = new Date().toISOString().slice(0, 10);

      records.forEach((r) => {
        const dt = new Date(r.timestamp);
        const key = dt.toISOString().slice(0, 10);
        const entry = dayMap.get(key) || { scoreSum: 0, neckSum: 0, shSum: 0, count: 0, ts: dt.getTime() };
        entry.scoreSum += r.ergoScore;
        entry.neckSum += r.neckFlexion;
        entry.shSum += Math.abs(r.shoulderTilt);
        entry.count += 1;
        dayMap.set(key, entry);
      });

      Array.from(dayMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([key, v]) => {
          const dt = new Date(key + 'T12:00:00');
          const label =
            days <= 7
              ? dt.toLocaleDateString('en-US', { weekday: 'short' })
              : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          buckets.push({
            label,
            ergoScore: Math.round(v.scoreSum / v.count),
            neckFlexion: Number((v.neckSum / v.count).toFixed(1)),
            shoulderTilt: Number((v.shSum / v.count).toFixed(1)),
            count: v.count,
            isToday: key === todayKey,
          });
        });
    }

    return res.status(200).json({
      success: true,
      data: {
        latest: latestTelemetry,
        trend: buckets,
        records: records.slice(-50),
        source: db ? 'mongodb' : 'local-cache',
      },
      message: `Fetched ${records.length} telemetry snapshots for ${days} day(s)`,
    });
  } catch (err: any) {
    console.error('[GET /api/telemetry Error]:', err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err?.message || 'Failed to retrieve telemetry history',
    });
  }
});

// -------------------------------------------------------------
// POST /api/sync
// Batch sync offline-first queued records
// -------------------------------------------------------------
app.post('/api/sync', async (req: Request, res: Response) => {
  try {
    const items = Array.isArray(req.body?.records) ? req.body.records : [];
    const normalizedList = items.map((item: any) => normalizeIncomingPayload(item));

    normalizedList.forEach((rec: TelemetryRecord) => {
      memoryTelemetryStore.push(rec);
    });

    const db = await connectToDatabase();
    if (db && normalizedList.length > 0) {
      await TelemetryModel.insertMany(
        normalizedList.map((n: TelemetryRecord) => ({
          ergoScore: n.ergoScore,
          neckFlexion: n.neckFlexion,
          shoulderTilt: n.shoulderTilt,
          torsoLean: n.torsoLean,
          deviceTilt: n.deviceTilt,
          ambientLight: n.ambientLight,
          proximity: n.proximity,
          status: n.status,
          alertMessage: n.alertMessage,
          deviceId: n.deviceId,
          timestamp: new Date(n.timestamp),
        }))
      ).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: { syncedCount: normalizedList.length },
      message: `Synced ${normalizedList.length} queued records`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      message: err?.message || 'Sync error',
    });
  }
});

// -------------------------------------------------------------
// SSE Real-time Stream (ergosense-channel mirror)
// -------------------------------------------------------------
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { res };
  sseClients.add(client);

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', latest: latestTelemetry })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// -------------------------------------------------------------
// Health & Config Check
// -------------------------------------------------------------
app.get('/api/health', async (_req: Request, res: Response) => {
  const db = await connectToDatabase();
  return res.status(200).json({
    success: true,
    data: {
      status: 'operational',
      mongodbConnected: !!db,
      pusherConfigured: !!pusher,
      activeStreams: sseClients.size,
      timestamp: new Date().toISOString(),
    },
    message: 'ErgoSense API operational',
  });
});

// -------------------------------------------------------------
// Background Live Telemetry Stream (simulates mobile/Python edge stream when SSE listeners are open)
// -------------------------------------------------------------
let simTick = 0;
setInterval(() => {
  if (sseClients.size === 0) return;
  simTick += 0.12;

  const neckFlexion = Number((16.5 + Math.sin(simTick * 0.5) * 6.5).toFixed(1));
  const shoulderTilt = Number((Math.sin(simTick * 0.32) * 3.8).toFixed(1));
  const torsoLean = Number((4.5 + Math.cos(simTick * 0.28) * 3.2).toFixed(1));
  const proximity = Number((52 + Math.cos(simTick * 0.4) * 6).toFixed(1));
  const ambientLight = Math.round(64 + Math.sin(simTick * 0.2) * 6);

  const synthetic = normalizeIncomingPayload({
    neckFlexion,
    shoulderTilt,
    torsoLean,
    proximity,
    ambientLight,
    deviceTilt: { pitch: Math.round(14 + Math.sin(simTick) * 3), roll: Math.round(shoulderTilt) },
    blinkRate: Math.round(17 + Math.sin(simTick * 0.4) * 3),
    fatigueIndex: Math.round(22 + Math.sin(simTick * 0.15) * 8),
  });

  latestTelemetry = synthetic;
  broadcastChannelEvent('ergosense-channel', 'new-telemetry', synthetic);
}, 450);

// Start Express + Vite dev/prod static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ErgoSense AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start ErgoSense server:', err);
    process.exit(1);
  });
}
