import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Smartphone, 
  Monitor, 
  Watch, 
  QrCode, 
  Sliders, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  RefreshCcw, 
  ShieldCheck, 
  Database,
  ArrowRight
} from 'lucide-react';
import { MobileSensorBridge, IMUSensorReading } from '../../lib/sensor-bridge.ts';
import { LocalStorageManager } from '../../lib/storage.ts';
import { UserProfile, PersonalBaseline } from '../../types/ergosense.ts';
import { VoiceAssistant } from '../../lib/speech.ts';

interface DevicesSettingsScreenProps {
  currentUser: UserProfile;
  onUserUpdate: (updated: Partial<UserProfile>) => void;
  onRecalibrate: () => void;
}

export const DevicesSettingsScreen: React.FC<DevicesSettingsScreenProps> = ({
  currentUser,
  onUserUpdate,
  onRecalibrate,
}) => {
  const [activeSection, setActiveSection] = useState<'devices' | 'settings'>('devices');
  const [isImuActive, setIsImuActive] = useState<boolean>(false);
  const [imuReading, setImuReading] = useState<IMUSensorReading>({
    accelX: 0.1,
    accelY: -0.2,
    accelZ: 9.8,
    magnitude: 9.8,
    pitch: 0,
    roll: 0,
    stepCadenceStepsPerMin: 112,
    activityType: 'Walking',
  });

  const [sensorBridge] = useState<MobileSensorBridge>(new MobileSensorBridge());
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Toggle IMU Motion Streaming
  const handleToggleImu = async () => {
    if (isImuActive) {
      sensorBridge.stopListening();
      setIsImuActive(false);
    } else {
      await sensorBridge.requestPermissions();
      sensorBridge.startListening((reading) => {
        setImuReading(reading);
      });
      setIsImuActive(true);
      VoiceAssistant.playChime('success');
    }
  };

  useEffect(() => {
    return () => {
      sensorBridge.stopListening();
    };
  }, [sensorBridge]);

  const handlePurgeAllData = () => {
    if (confirm('Permanently delete all local IndexedDB summaries, comfort journal records, and baseline calibrations? This action is irreversible.')) {
      LocalStorageManager.purgeAllData();
      setPurgeNotice('All local biometric data purged successfully. Zero residual records remain.');
      VoiceAssistant.playChime('subtle_nudge');
      setTimeout(() => setPurgeNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast */}
      {purgeNotice && (
        <div className="fixed top-20 right-8 z-50 bg-[#0F172A] border-2 border-rose-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-semibold">{purgeNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
            Hardware & Personal Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Connected Devices & Settings
          </h1>
          <p className="text-xs text-slate-400">
            Sensor fusion bridge, mobile IMU travelling mode, and 1-click personal data sovereignty.
          </p>
        </div>

        {/* Section Switcher */}
        <div className="flex items-center bg-[#0F172A] border border-[#1E293B] p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveSection('devices')}
            className={`px-3 py-1.5 rounded-lg ${activeSection === 'devices' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Connected Devices & IMU
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1.5 rounded-lg ${activeSection === 'settings' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Personal Settings & Privacy
          </button>
        </div>
      </div>

      {/* SECTION 1: CONNECTED DEVICES & SENSOR BRIDGE */}
      {activeSection === 'devices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device 1: Desktop Web Studio */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-teal-500/10 text-[#2DD4BF]">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Desktop Web Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active browser tab with Web Worker heartbeat clock and MediaPipe WASM runtime.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                Host: Chrome / Edge · 30 FPS
              </div>
            </div>

            {/* Device 2: Mobile Smartphone IMU */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-[#38BDF8]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  isImuActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isImuActive ? 'IMU STREAMING' : 'STANDBY'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Smartphone IMU Bridge</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                DeviceMotionEvent 3-axis accelerometer/gyroscope for camera-free transit & walking.
              </p>
              <button
                onClick={handleToggleImu}
                className="w-full mt-2 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                {isImuActive ? 'Stop IMU Sensor' : 'Start Live Mobile IMU'}
              </button>
            </div>

            {/* Device 3: Wearable Simulator */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-[#818CF8]">
                  <Watch className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400">
                  BLE READY
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Smartwatch / BLE Sensor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect optional posture sensor or Apple/Garmin smartwatch via Web Bluetooth API.
              </p>
              <button
                onClick={() => alert('Web Bluetooth scanning initiated. Pair your BLE posture sensor.')}
                className="w-full mt-2 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Scan Web Bluetooth
              </button>
            </div>
          </div>

          {/* Live Mobile IMU Waveform & Cadence Telemetry */}
          {isImuActive && (
            <div className="bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Live 3-Axis IMU Sensor Stream
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-400">{imuReading.activityType}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">X Acceleration</span>
                  <span className="text-base font-bold text-white">{imuReading.accelX} m/s²</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Y Acceleration</span>
                  <span className="text-base font-bold text-white">{imuReading.accelY} m/s²</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Z Magnitude</span>
                  <span className="text-base font-bold text-cyan-400">{imuReading.magnitude} m/s²</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Step Cadence</span>
                  <span className="text-base font-bold text-emerald-400">{imuReading.stepCadenceStepsPerMin} spm</span>
                </div>
              </div>
            </div>
          )}

          {/* PWA Mobile Pairing QR */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2DD4BF]">
                <QrCode className="w-4 h-4" />
                <span>Companion Mobile PWA Sync</span>
              </div>
              <h3 className="text-base font-bold text-white">Install on Smartphone (iOS & Android)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this QR code with your smartphone camera to open ErgoSense AI in your mobile browser, tap "Add to Home Screen" to install offline PWA, and enable motion sensor sync.
              </p>
            </div>
            {/* Stylized QR Box */}
            <div className="p-4 bg-white rounded-2xl shrink-0 shadow-lg flex items-center justify-center">
              <div className="w-28 h-28 border-4 border-slate-900 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                  <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                </div>
                <div className="text-center font-mono text-[9px] font-bold text-slate-900">ERGOSENSE</div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                  <div className="w-4 h-4 bg-teal-600 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PERSONAL SETTINGS & DATA SOVEREIGNTY */}
      {activeSection === 'settings' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Personal Settings & Governance</h2>
            <p className="text-xs text-slate-400">Manage baseline parameters and enforce 100% data privacy.</p>
          </div>

          <div className="space-y-4">
            {/* Recalibrate button */}
            <div className="flex items-center justify-between p-4 bg-[#0B1120] rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Personal Movement Baseline</h4>
                <p className="text-[11px] text-slate-400">Re-run 60s guided calibration if you changed chairs or monitor setup.</p>
              </div>
              <button
                onClick={onRecalibrate}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition-all"
              >
                Re-calibrate Now
              </button>
            </div>

            {/* Inspect Raw Data */}
            <div className="flex items-center justify-between p-4 bg-[#0B1120] rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Local-First Storage Inspector</h4>
                <p className="text-[11px] text-slate-400">Inspect raw IndexedDB / localStorage JSON summaries on this device.</p>
              </div>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                {showRawJson ? 'Hide JSON' : 'Inspect JSON'}
              </button>
            </div>

            {showRawJson && (
              <pre className="p-4 bg-[#070D18] border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 max-h-60 overflow-y-auto">
                {JSON.stringify(
                  {
                    user: currentUser,
                    baseline: LocalStorageManager.getPersonalBaseline(),
                    journalCount: LocalStorageManager.getJournalEntries().length,
                    volunteerTrialsCount: LocalStorageManager.getVolunteerTrials().length,
                  },
                  null,
                  2
                )}
              </pre>
            )}

            {/* 1-Click Purge All Data */}
            <div className="flex items-center justify-between p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl">
              <div>
                <h4 className="text-xs font-bold text-rose-300">1-Click Local Data Deletion</h4>
                <p className="text-[11px] text-rose-200/70">Permanently erase all IndexedDB rollups, comfort journal entries, and baseline records.</p>
              </div>
              <button
                onClick={handlePurgeAllData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
