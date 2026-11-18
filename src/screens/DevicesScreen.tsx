import React, { useState } from 'react';
import { 
  Smartphone, 
  QrCode, 
  Wifi, 
  Check, 
  Copy, 
  RotateCw, 
  ExternalLink, 
  BatteryCharging, 
  ShieldCheck, 
  ArrowRight,
  Terminal,
  Signal
} from 'lucide-react';
import { LinkedDevice } from '../types/ergosense.ts';

interface DevicesScreenProps {
  devices: LinkedDevice[];
  onSimulateConnect: () => void;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({
  devices,
  onSimulateConnect,
}) => {
  const [pin, setPin] = useState<string>('842-195');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectedToast, setConnectedToast] = useState<string | null>(null);

  const localSocketUrl = `wss://${window.location.host}/api/stream?channel=user-usr_ergo_01`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(localSocketUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSimulate = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnectedToast('Device pairing handshake verified via Pusher sub-40ms channel!');
      onSimulateConnect();
      setTimeout(() => setConnectedToast(null), 4000);
    }, 1200);
  };

  const regeneratePin = () => {
    const randomPin = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setPin(randomPin);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {connectedToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{connectedToast}</span>
          </div>
          <button onClick={() => setConnectedToast(null)} className="text-emerald-400 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00BFA5]" />
            Device Linking &amp; Companion Pairing
          </h2>
          <p className="text-xs text-slate-400">
            Establish zero-latency bilateral communication between Android native app and Web Platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR PAIRING CARD: Desktop <-> Mobile Socket (col-span-7) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#00BFA5]" />
                Desktop &lt;-&gt; Mobile Socket
              </h3>
              <p className="text-xs text-slate-400">
                Scan with the ErgoSense Android companion app to bind telemetry channel
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-teal-950/80 text-teal-400 border border-teal-500/30">
              Pusher Sub-40ms
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* High fidelity SVG QR Code Placeholder */}
            <div className="relative p-3.5 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                {/* 3 Position Corners */}
                <rect x="5" y="5" width="28" height="28" fill="#0B1120" rx="3" />
                <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="13" width="12" height="12" fill="#00BFA5" rx="1" />

                <rect x="67" y="5" width="28" height="28" fill="#0B1120" rx="3" />
                <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="75" y="13" width="12" height="12" fill="#00BFA5" rx="1" />

                <rect x="5" y="67" width="28" height="28" fill="#0B1120" rx="3" />
                <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="75" width="12" height="12" fill="#00BFA5" rx="1" />

                {/* Matrix dots */}
                <rect x="40" y="8" width="8" height="8" fill="#0B1120" />
                <rect x="52" y="8" width="8" height="8" fill="#0B1120" />
                <rect x="40" y="20" width="8" height="8" fill="#0B1120" />
                <rect x="52" y="20" width="8" height="8" fill="#00BFA5" />

                <rect x="8" y="40" width="8" height="8" fill="#0B1120" />
                <rect x="20" y="40" width="8" height="8" fill="#0B1120" />
                <rect x="8" y="52" width="8" height="8" fill="#00BFA5" />
                <rect x="20" y="52" width="8" height="8" fill="#0B1120" />

                <rect x="38" y="38" width="24" height="24" fill="#0B1120" rx="4" />
                <circle cx="50" cy="50" r="6" fill="#00BFA5" />

                <rect x="68" y="40" width="8" height="8" fill="#0B1120" />
                <rect x="80" y="40" width="8" height="8" fill="#00BFA5" />
                <rect x="68" y="52" width="8" height="8" fill="#0B1120" />
                <rect x="80" y="52" width="8" height="8" fill="#0B1120" />

                <rect x="40" y="68" width="8" height="8" fill="#0B1120" />
                <rect x="52" y="68" width="8" height="8" fill="#00BFA5" />
                <rect x="40" y="80" width="8" height="8" fill="#0B1120" />
                <rect x="52" y="80" width="8" height="8" fill="#0B1120" />

                <rect x="68" y="68" width="8" height="8" fill="#0B1120" />
                <rect x="80" y="68" width="8" height="8" fill="#0B1120" />
                <rect x="68" y="80" width="8" height="8" fill="#00BFA5" />
                <rect x="80" y="80" width="8" height="8" fill="#0B1120" />
              </svg>
            </div>

            {/* 6-Digit PIN & Socket info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  6-Digit Pairing PIN:
                </span>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-[#0B1120] border border-[#1E293B] rounded-xl font-mono text-2xl font-black tracking-widest text-[#00BFA5]">
                    {pin}
                  </div>
                  <button
                    onClick={regeneratePin}
                    title="Regenerate PIN"
                    className="p-2.5 bg-[#131E33] hover:bg-[#1E293B] text-slate-400 hover:text-white rounded-xl border border-[#1E293B]"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Local websocket URL */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Local WebSocket / SSE Ingestion URL:
                </span>
                <div className="flex items-center gap-2 bg-[#0B1120] p-2 rounded-xl border border-[#1E293B]">
                  <span className="text-xs font-mono text-slate-300 truncate flex-1">
                    {localSocketUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: "Simulate Connect" and "Scan Desktop QR" */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleSimulate}
              disabled={connecting}
              className={`flex-1 w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                connecting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120] shadow-md shadow-teal-500/20 active:scale-95'
              }`}
            >
              <Wifi className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} />
              <span>{connecting ? 'Establishing Socket...' : 'Simulate Connect'}</span>
            </button>

            <button
              onClick={() => {
                setConnectedToast('Camera scanner open. Point at native Android app screen.');
                setTimeout(() => setConnectedToast(null), 3000);
              }}
              className="flex-1 w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#131E33] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-[#00BFA5]" />
              <span>Scan Desktop QR</span>
            </button>
          </div>
        </div>

        {/* Linked Devices Status List (col-span-5) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#00BFA5]" />
              Active Companion Devices
            </h3>
            <span className="text-xs text-slate-400">{devices.length} Paired</span>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 space-y-2 hover:border-teal-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">{dev.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                    {dev.platform.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
                    <span>{dev.batteryLevel}% Battery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sub-40ms Synced</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-[#1E293B]/60">
                  <span>Location: {dev.ipLocation}</span>
                  <span className="text-emerald-400 font-medium">Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
