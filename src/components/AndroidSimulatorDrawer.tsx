import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Square, 
  Send, 
  Smartphone, 
  Terminal, 
  Check, 
  Copy, 
  Zap, 
  Activity, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { TelemetryPayload } from '../types/ergosense.ts';
import { sendTelemetry } from '../services/api.ts';

interface AndroidSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onTelemetryUpdated: (payload: TelemetryPayload) => void;
}

export const AndroidSimulatorDrawer: React.FC<AndroidSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  onTelemetryUpdated,
}) => {
  const [tilt, setTilt] = useState<number>(11.5);
  const [dist, setDist] = useState<number>(56.0);
  const [fatigue, setFatigue] = useState<number>(20);
  const [blink, setBlink] = useState<number>(18);
  const [battery, setBattery] = useState<number>(88);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamHz, setStreamHz] = useState<number>(25); // 25 Hz = 40ms
  const [packetCount, setPacketCount] = useState<number>(0);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(18);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Apply quick presets
  const applyPreset = (preset: 'optimal' | 'mild' | 'severe' | 'screen_hugger') => {
    if (preset === 'optimal') {
      setTilt(9.2);
      setDist(62.0);
      setFatigue(15);
      setBlink(19);
    } else if (preset === 'mild') {
      setTilt(18.5);
      setDist(44.0);
      setFatigue(35);
      setBlink(14);
    } else if (preset === 'severe') {
      setTilt(29.8);
      setDist(34.0);
      setFatigue(68);
      setBlink(10);
    } else if (preset === 'screen_hugger') {
      setTilt(22.0);
      setDist(28.5);
      setFatigue(55);
      setBlink(11);
    }
  };

  const dispatchSingleTelemetry = async (overrideTilt?: number, overrideDist?: number) => {
    const t0 = performance.now();
    const payload: TelemetryPayload = {
      userId,
      deviceId: 'dev_pixel_8_pro',
      timestamp: Date.now(),
      cervicalTiltDeg: overrideTilt ?? tilt,
      proximityCm: overrideDist ?? dist,
      headPitchDeg: (overrideTilt ?? tilt) * 0.9,
      headRollDeg: (Math.random() - 0.5) * 2,
      blinkRatePerMin: blink,
      fatigueIndex: fatigue,
      ambientLightLux: 350,
      batteryLevel: battery,
    };

    try {
      const result = await sendTelemetry(payload);
      const lat = Math.round(performance.now() - t0);
      setLastLatencyMs(lat);
      setPacketCount((c) => c + 1);
      if (result) onTelemetryUpdated(result);
    } catch (e) {
      console.error('Failed to send simulated telemetry:', e);
    }
  };

  // Continuous loop for sub-40ms stream
  useEffect(() => {
    if (!isStreaming) return;

    const intervalMs = Math.round(1000 / streamHz); // 40ms at 25Hz
    const timer = setInterval(() => {
      // Add tiny natural human micro-jitter
      const microJitter = (Math.random() - 0.5) * 0.4;
      const currentTilt = Math.max(0, tilt + microJitter);
      const currentDist = Math.max(20, dist + (Math.random() - 0.5) * 0.6);

      dispatchSingleTelemetry(Number(currentTilt.toFixed(1)), Number(currentDist.toFixed(1)));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamHz, tilt, dist, fatigue, blink, battery, userId]);

  const curlCommand = `curl -X POST "${window.location.origin}/api/telemetry" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${userId}",
    "deviceId": "dev_pixel_8_pro",
    "cervicalTiltDeg": ${tilt},
    "proximityCm": ${dist},
    "fatigueIndex": ${fatigue},
    "blinkRatePerMin": ${blink},
    "batteryLevel": ${battery},
    "timestamp": ${Date.now()}
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0B1120] border-l border-[#1E293B] h-full overflow-y-auto flex flex-col p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#131E33] border border-[#1E293B] text-[#00BFA5]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Android Telemetry Injector
              </h3>
              <p className="text-xs text-slate-400">
                Companion Hardware Stream Emulator (sub-40ms)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#131E33] text-slate-400 hover:text-white border border-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Stream Status & Frequency */}
        <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Live Ingestion Engine
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-xs font-mono text-slate-300">
                {isStreaming ? `${streamHz} Hz (${Math.round(1000/streamHz)}ms)` : 'Idle'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#0B1120] p-2.5 rounded-lg border border-[#1E293B]">
              <div className="text-slate-500 text-[10px]">PACKETS SENT</div>
              <div className="font-mono font-bold text-white text-base mt-0.5">{packetCount}</div>
            </div>
            <div className="bg-[#0B1120] p-2.5 rounded-lg border border-[#1E293B]">
              <div className="text-slate-500 text-[10px]">INGESTION LATENCY</div>
              <div className="font-mono font-bold text-[#00BFA5] text-base mt-0.5">{lastLatencyMs} ms</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                isStreaming
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120]'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Sub-40ms Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Start Live Sub-40ms Stream
                </>
              )}
            </button>

            <button
              onClick={() => dispatchSingleTelemetry()}
              disabled={isStreaming}
              title="Send Single Packet"
              className="px-3 py-2.5 rounded-lg bg-[#0B1120] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Biometric Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Posture Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyPreset('optimal')}
              className="p-2.5 rounded-lg bg-[#131E33] hover:border-emerald-500/50 border border-[#1E293B] text-left transition-all"
            >
              <div className="text-xs font-bold text-emerald-400">Optimal (9.2°)</div>
              <div className="text-[10px] text-slate-400">Ergonomic alignment</div>
            </button>
            <button
              onClick={() => applyPreset('mild')}
              className="p-2.5 rounded-lg bg-[#131E33] hover:border-amber-500/50 border border-[#1E293B] text-left transition-all"
            >
              <div className="text-xs font-bold text-amber-400">Mild Slouch (18.5°)</div>
              <div className="text-[10px] text-slate-400">Forward cervical strain</div>
            </button>
            <button
              onClick={() => applyPreset('severe')}
              className="p-2.5 rounded-lg bg-[#131E33] hover:border-rose-500/50 border border-[#1E293B] text-left transition-all"
            >
              <div className="text-xs font-bold text-rose-400">Critical Slouch (29.8°)</div>
              <div className="text-[10px] text-slate-400">Heavy cervical load</div>
            </button>
            <button
              onClick={() => applyPreset('screen_hugger')}
              className="p-2.5 rounded-lg bg-[#131E33] hover:border-cyan-500/50 border border-[#1E293B] text-left transition-all"
            >
              <div className="text-xs font-bold text-cyan-400">Screen Hugger (28cm)</div>
              <div className="text-[10px] text-slate-400">High visual strain</div>
            </button>
          </div>
        </div>

        {/* Sliders for Biometrics */}
        <div className="space-y-4 bg-[#131E33] border border-[#1E293B] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Cervical Spine Angle
            </label>
            <span className="font-mono text-xs font-bold text-[#00BFA5]">{tilt.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="0.5"
            value={tilt}
            onChange={(e) => setTilt(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#00BFA5]"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Screen Proximity (TrueDepth)
            </label>
            <span className="font-mono text-xs font-bold text-cyan-400">{dist.toFixed(1)} cm</span>
          </div>
          <input
            type="range"
            min="25"
            max="80"
            step="0.5"
            value={dist}
            onChange={(e) => setDist(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Visual Fatigue Index
            </label>
            <span className="font-mono text-xs font-bold text-amber-400">{fatigue}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={fatigue}
            onChange={(e) => setFatigue(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Blink Rate
            </label>
            <span className="font-mono text-xs font-bold text-slate-200">{blink} blinks/min</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={blink}
            onChange={(e) => setBlink(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>

        {/* cURL Snippet for Native Android Developers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00BFA5]" />
              Android Retrofit / cURL Snippet
            </span>
            <button
              onClick={copyCurl}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCurl ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 bg-[#0B1120] border border-[#1E293B] rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
            {curlCommand}
          </pre>
        </div>
      </div>
    </div>
  );
};
