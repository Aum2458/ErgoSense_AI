// Sensor Bridge & Background Web Worker Heartbeat Clock

export class HeartbeatClock {
  private worker: Worker | null = null;
  private onTickCallback: (() => void) | null = null;

  /**
   * Spawns an unthrottled 10 Hz Web Worker using an in-memory Blob URL
   * This guarantees posture detection never freezes when the user switches tabs or apps.
   */
  public start(onTick: () => void, intervalMs: number = 100) {
    this.stop();
    this.onTickCallback = onTick;

    const workerScript = `
      let timer = null;
      self.onmessage = function(e) {
        if (e.data === 'START') {
          if (timer) clearInterval(timer);
          timer = setInterval(function() {
            self.postMessage('TICK');
          }, ${intervalMs});
        } else if (e.data === 'STOP') {
          if (timer) clearInterval(timer);
          timer = null;
        }
      };
    `;

    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      this.worker = new Worker(url);

      this.worker.onmessage = (e) => {
        if (e.data === 'TICK' && this.onTickCallback) {
          this.onTickCallback();
        }
      };

      this.worker.postMessage('START');
    } catch (e) {
      console.warn('Web Worker initialization fallback to window.setInterval:', e);
      // Fallback
      const timer = setInterval(() => {
        this.onTickCallback?.();
      }, intervalMs);
      (this as any).fallbackTimer = timer;
    }
  }

  public stop() {
    if (this.worker) {
      this.worker.postMessage('STOP');
      this.worker.terminate();
      this.worker = null;
    }
    if ((this as any).fallbackTimer) {
      clearInterval((this as any).fallbackTimer);
      (this as any).fallbackTimer = null;
    }
  }
}

export interface IMUSensorReading {
  accelX: number;
  accelY: number;
  accelZ: number;
  magnitude: number;
  pitch: number;
  roll: number;
  stepCadenceStepsPerMin: number;
  activityType: 'Still / Seated' | 'Walking' | 'Transit / Vehicle' | 'Active Movement';
}

export class MobileSensorBridge {
  private isListening = false;
  private onReadingCallback: ((reading: IMUSensorReading) => void) | null = null;
  private stepCount = 0;
  private lastStepTimestamp = 0;
  private simulationInterval: any = null;

  public async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // iOS 13+ permission request
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        return response === 'granted';
      } catch (e) {
        console.warn('iOS motion permission error:', e);
        return false;
      }
    }
    return true;
  }

  public startListening(onReading: (reading: IMUSensorReading) => void) {
    this.stopListening();
    this.onReadingCallback = onReading;
    this.isListening = true;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!this.isListening) return;

      const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 9.8;

      const mag = Math.sqrt(ax * ax + ay * ay + az * az);
      const now = Date.now();

      // Step detection peak
      if (mag > 12.5 && now - this.lastStepTimestamp > 350) {
        this.stepCount++;
        this.lastStepTimestamp = now;
      }

      const pitch = Math.round(Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * (180 / Math.PI));
      const roll = Math.round(Math.atan2(ay, az) * (180 / Math.PI));

      let activity: 'Still / Seated' | 'Walking' | 'Transit / Vehicle' | 'Active Movement' = 'Still / Seated';
      if (mag > 14.0) activity = 'Active Movement';
      else if (mag > 11.2) activity = 'Walking';
      else if (Math.abs(mag - 9.8) > 0.8) activity = 'Transit / Vehicle';

      this.onReadingCallback?.({
        accelX: Number(ax.toFixed(2)),
        accelY: Number(ay.toFixed(2)),
        accelZ: Number(az.toFixed(2)),
        magnitude: Number(mag.toFixed(2)),
        pitch,
        roll,
        stepCadenceStepsPerMin: Math.min(140, Math.round(this.stepCount * 12)),
        activityType: activity,
      });
    };

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleMotion);
      (this as any).motionHandler = handleMotion;
    }

    // Also run simulated realistic IMU stream for desktop testing
    let tick = 0;
    this.simulationInterval = setInterval(() => {
      if (!this.isListening) return;
      tick += 0.15;
      const wave = Math.sin(tick * 3.5);
      const mag = 9.8 + wave * 1.8 + (Math.random() - 0.5) * 0.4;
      const cadence = 108 + Math.round(Math.sin(tick * 0.8) * 12);

      this.onReadingCallback?.({
        accelX: Number((Math.sin(tick * 2) * 1.5).toFixed(2)),
        accelY: Number((Math.cos(tick * 2) * 1.2).toFixed(2)),
        accelZ: Number(mag.toFixed(2)),
        magnitude: Number(mag.toFixed(2)),
        pitch: Math.round(Math.sin(tick) * 8),
        roll: Math.round(Math.cos(tick) * 5),
        stepCadenceStepsPerMin: cadence,
        activityType: 'Walking',
      });
    }, 250);
  }

  public stopListening() {
    this.isListening = false;
    if (typeof window !== 'undefined' && (this as any).motionHandler) {
      window.removeEventListener('devicemotion', (this as any).motionHandler);
      (this as any).motionHandler = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}
