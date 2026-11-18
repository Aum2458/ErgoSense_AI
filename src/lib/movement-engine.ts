import {
  BiomechanicalState,
  PersonalBaseline,
  ExerciseSessionState,
  ExerciseType,
  ExerciseFSMState,
} from '../types/ergosense.ts';

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface LandmarkFrame {
  landmarks: Point3D[];
  timestamp: number;
}

export interface BiomechanicalMetrics {
  cervicalAngleDeg: number;       // theta_neck
  torsoInclinationDeg: number;    // theta_torso
  shoulderAsymmetryRatio: number; // Delta_shoulder
  shoulderTiltDeg: number;
  viewingDistanceCm: number;      // D_cm
  zScore: number;                 // max personal Z_i
  landmarkConfidence: number;     // mean visibility
  hipsVisible: boolean;
  microMotionVariance: number;    // sigma^2_motion
  state: BiomechanicalState;
  deviationRatio: number;         // in 30s rolling buffer
  guidanceText: string;
}

// Default baseline when not yet calibrated
export const DEFAULT_PERSONAL_BASELINE: PersonalBaseline = {
  cervicalFlexion: { mean: 12.0, stdDev: 3.5, minComfortable: 5.0, maxComfortable: 18.0 },
  torsoInclination: { mean: 4.0, stdDev: 2.5, minComfortable: 0.0, maxComfortable: 10.0 },
  shoulderAsymmetry: { mean: 0.02, stdDev: 0.025, minComfortable: 0.0, maxComfortable: 0.06 },
  baselineZDepth: -0.45,
  shoulderPixelWidth: 160,
  calibratedAt: Date.now(),
  isCalibrated: false,
  phaseACompleted: false,
  phaseBCompleted: false,
};

export class MovementEngine {
  private smoothedLandmarks: Point3D[] = [];
  private readonly alpha = 0.25; // EMA filter coefficient
  private readonly verticalRef = { x: 0, y: -1, z: 0 }; // Inverted Y reference (MediaPipe +Y points down)
  private focalLengthPx = 650; // Standard webcam focal length estimate

  // 30-Second Rolling Temporal Buffer (stores recent deviation flags)
  // At 5-10 Hz, 30 seconds = ~150 to 300 samples
  private rollingBuffer: { timestamp: number; isDeviated: boolean }[] = [];
  private readonly rollingWindowMs = 30000;

  // Micro-motion variance tracking over rolling 5 minutes
  private motionHistory: { timestamp: number; x: number; y: number }[] = [];
  private readonly motionWindowMs = 300000;

  // Static load session timer
  private sessionStartTime = Date.now();
  private lastSubstantialMovementTime = Date.now();
  private lastAlertTime = 0;
  private readonly alertCooldownMs = 180000; // 3 minutes hysteresis cooldown

  // Closed-loop active baseline
  private activeBaseline: PersonalBaseline;

  // Exercise FSM Tracker
  private exerciseState: ExerciseSessionState = {
    exercise: 'squats',
    fsmState: 'READY',
    reps: 0,
    tempoSec: 0,
    symmetryScore: 95,
    currentDepthPct: 0,
    guidanceCue: 'Stand tall with feet shoulder-width apart to begin.',
  };
  private repStartTime = 0;

  // Factory mode: Upper-limb repetitive cadence counter
  private factoryElevationHistory: { timestamp: number; elevated: boolean }[] = [];
  private factoryCycleCount = 0;

  // Elderly balance: mediolateral sway variance
  private swayCenterHistory: { timestamp: number; x: number }[] = [];

  constructor(initialBaseline: PersonalBaseline = DEFAULT_PERSONAL_BASELINE) {
    this.activeBaseline = { ...initialBaseline };
  }

  public setBaseline(baseline: PersonalBaseline) {
    this.activeBaseline = { ...baseline };
  }

  public getBaseline(): PersonalBaseline {
    return this.activeBaseline;
  }

  /**
   * EMA low-pass filtering:
   * P_hat_k(t) = alpha * P_k(t) + (1 - alpha) * P_hat_k(t-1)
   */
  public smoothLandmarks(raw: Point3D[]): Point3D[] {
    if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== raw.length) {
      this.smoothedLandmarks = raw.map((p) => ({ ...p }));
      return this.smoothedLandmarks;
    }

    this.smoothedLandmarks = raw.map((p, i) => {
      const prev = this.smoothedLandmarks[i];
      return {
        x: this.alpha * p.x + (1 - this.alpha) * prev.x,
        y: this.alpha * p.y + (1 - this.alpha) * prev.y,
        z: this.alpha * p.z + (1 - this.alpha) * prev.z,
        visibility: p.visibility !== undefined ? p.visibility : 1.0,
      };
    });

    return this.smoothedLandmarks;
  }

  /**
   * Evaluates biomechanical state from 33 MediaPipe Pose landmarks
   * Landmark indices:
   * 0: nose, 7: left_ear, 8: right_ear,
   * 11: left_shoulder, 12: right_shoulder,
   * 13: left_elbow, 14: right_elbow,
   * 15: left_wrist, 16: right_wrist,
   * 23: left_hip, 24: right_hip,
   * 25: left_knee, 26: right_knee,
   * 27: left_ankle, 28: right_ankle
   */
  public processFrame(
    rawLandmarks: Point3D[],
    timestamp: number = Date.now(),
    videoWidth: number = 640
  ): BiomechanicalMetrics {
    if (!rawLandmarks || rawLandmarks.length < 25) {
      return this.createUnreliableMetrics('Camera feed unavailable or landmarks undetected.');
    }

    const lm = this.smoothLandmarks(rawLandmarks);

    // Calculate upper-body landmark confidence
    const upperBodyIndices = [0, 7, 8, 11, 12];
    const meanConfidence =
      upperBodyIndices.reduce((acc, idx) => acc + (lm[idx]?.visibility ?? 1.0), 0) /
      upperBodyIndices.length;

    if (meanConfidence < 0.65) {
      return this.createUnreliableMetrics('Adjust camera angle or lighting to align face and shoulders.');
    }

    // Mid-ear tragion (P_7,8)
    const midEar = {
      x: (lm[7].x + lm[8].x) / 2,
      y: (lm[7].y + lm[8].y) / 2,
      z: (lm[7].z + lm[8].z) / 2,
    };

    // Mid-shoulder (P_11,12)
    const midShoulder = {
      x: (lm[11].x + lm[12].x) / 2,
      y: (lm[11].y + lm[12].y) / 2,
      z: (lm[11].z + lm[12].z) / 2,
    };

    // 1. Cervical Flexion Angle (theta_neck)
    // Vector ear - shoulder
    const neckVec = {
      x: midEar.x - midShoulder.x,
      y: midEar.y - midShoulder.y,
      z: midEar.z - midShoulder.z,
    };
    const neckMag = Math.sqrt(neckVec.x ** 2 + neckVec.y ** 2 + neckVec.z ** 2) || 1;
    // Dot product with verticalRef (0, -1, 0) -> -neckVec.y
    const neckCos = Math.max(-1, Math.min(1, (neckVec.x * 0 + neckVec.y * -1 + neckVec.z * 0) / neckMag));
    const rawCervicalDeg = Math.acos(neckCos) * (180 / Math.PI);
    // Neck angle relative to true upright (usually 0 to 45 deg)
    const cervicalAngleDeg = Number(rawCervicalDeg.toFixed(1));

    // 2. Hip Visibility Check & Seated Desk Occlusion Fallback
    const leftHipVis = lm[23]?.visibility ?? 0;
    const rightHipVis = lm[24]?.visibility ?? 0;
    const hipsVisible = Math.min(leftHipVis, rightHipVis) >= 0.5;

    let torsoInclinationDeg = 0;
    let shoulderAsymmetryRatio = 0;

    // Shoulder 3D width
    const shoulderDx = lm[11].x - lm[12].x;
    const shoulderDy = lm[11].y - lm[12].y;
    const shoulderDz = lm[11].z - lm[12].z;
    const shoulderWidth3D = Math.sqrt(shoulderDx ** 2 + shoulderDy ** 2 + shoulderDz ** 2) || 0.35;

    // Shoulder coronal tilt (deg)
    const shoulderTiltRad = Math.atan2(Math.abs(lm[11].y - lm[12].y), Math.abs(lm[11].x - lm[12].x) || 0.001);
    const shoulderTiltDeg = Number((shoulderTiltRad * (180 / Math.PI)).toFixed(1));

    if (hipsVisible) {
      // Hips visible -> direct torso inclination vector
      const midHip = {
        x: (lm[23].x + lm[24].x) / 2,
        y: (lm[23].y + lm[24].y) / 2,
        z: (lm[23].z + lm[24].z) / 2,
      };
      const torsoVec = {
        x: midShoulder.x - midHip.x,
        y: midShoulder.y - midHip.y,
        z: midShoulder.z - midHip.z,
      };
      const torsoMag = Math.sqrt(torsoVec.x ** 2 + torsoVec.y ** 2 + torsoVec.z ** 2) || 1;
      const torsoCos = Math.max(-1, Math.min(1, (torsoVec.y * -1) / torsoMag));
      torsoInclinationDeg = Number((Math.acos(torsoCos) * (180 / Math.PI)).toFixed(1));
      shoulderAsymmetryRatio = Number((Math.abs(lm[11].y - lm[12].y) / torsoMag).toFixed(3));
    } else {
      // Desk Occlusion Fallback
      shoulderAsymmetryRatio = Number((Math.abs(lm[11].y - lm[12].y) / shoulderWidth3D).toFixed(3));
      // Estimate forward lean from shoulder Z-depth shift vs calibrated baseline depth
      const zShift = midShoulder.z - this.activeBaseline.baselineZDepth;
      // When leaning forward toward the camera, z decreases (comes closer)
      const estimatedLean = Math.max(0, -zShift * 45);
      torsoInclinationDeg = Number(Math.min(40, estimatedLean).toFixed(1));
    }

    // 3. Desk Viewing Distance Estimation (D_cm = (14.5 * f_px) / ||p7 - p8||_px)
    const earDistanceNorm = Math.abs(lm[7].x - lm[8].x);
    const earDistancePx = Math.max(15, earDistanceNorm * videoWidth);
    const viewingDistanceCm = Math.round((14.5 * this.focalLengthPx) / earDistancePx);

    // 4. Personal Baseline Z-Scores
    // Z_i = |m_i - mu_i| / max(sigma_i, 2.5)
    const zNeck =
      Math.abs(cervicalAngleDeg - this.activeBaseline.cervicalFlexion.mean) /
      Math.max(this.activeBaseline.cervicalFlexion.stdDev, 2.5);

    const zTorso =
      Math.abs(torsoInclinationDeg - this.activeBaseline.torsoInclination.mean) /
      Math.max(this.activeBaseline.torsoInclination.stdDev, 2.5);

    const zShoulder =
      Math.abs(shoulderAsymmetryRatio - this.activeBaseline.shoulderAsymmetry.mean) /
      Math.max(this.activeBaseline.shoulderAsymmetry.stdDev, 0.02);

    const maxZScore = Number(Math.max(zNeck, zTorso, zShoulder).toFixed(2));

    // 5. Micro-motion variance tracking over 5 minutes (detect "statue sitting")
    this.motionHistory.push({ timestamp, x: lm[0].x, y: lm[0].y });
    this.motionHistory = this.motionHistory.filter((p) => timestamp - p.timestamp <= this.motionWindowMs);

    let microMotionVariance = 2.0;
    if (this.motionHistory.length >= 10) {
      const meanX = this.motionHistory.reduce((s, p) => s + p.x, 0) / this.motionHistory.length;
      const meanY = this.motionHistory.reduce((s, p) => s + p.y, 0) / this.motionHistory.length;
      const varSum = this.motionHistory.reduce((s, p) => s + (p.x - meanX) ** 2 + (p.y - meanY) ** 2, 0);
      // Scaled by 10000 for intuitive readability (typical range: 0.5 - 15.0)
      microMotionVariance = Number(((varSum / this.motionHistory.length) * 10000).toFixed(2));
    }

    // Substantial movement reset check
    if (microMotionVariance > 4.0 || maxZScore > 3.0) {
      this.lastSubstantialMovementTime = timestamp;
    }

    // 6. 30-Second Rolling Temporal Buffer
    const isFrameDeviated = maxZScore > 2.0 || shoulderAsymmetryRatio > 0.08 || viewingDistanceCm < 42;
    this.rollingBuffer.push({ timestamp, isDeviated: isFrameDeviated });
    this.rollingBuffer = this.rollingBuffer.filter((item) => timestamp - item.timestamp <= this.rollingWindowMs);

    const deviatedCount = this.rollingBuffer.filter((i) => i.isDeviated).length;
    const deviationRatio = this.rollingBuffer.length > 0 ? deviatedCount / this.rollingBuffer.length : 0;

    // 7. 5-State Temporal Hysteresis State Machine
    let state: BiomechanicalState = 'OPTIMAL';
    let guidanceText = 'Posture aligns smoothly with your calibrated movement baseline.';

    const staticDurationMins = (timestamp - this.lastSubstantialMovementTime) / 60000;

    if (staticDurationMins >= 40 && microMotionVariance < 1.2) {
      state = 'STATIC_FATIGUE';
      guidanceText = 'Prolonged static posture detected (40+ mins). Time for a 60-second thoracic stretch.';
    } else if (isFrameDeviated) {
      if (deviationRatio >= 0.75 && this.rollingBuffer.length >= 15) {
        state = 'SUSTAINED_DEVIATION';
        if (cervicalAngleDeg > 20) {
          guidanceText = 'Sustained cervical flexion detected. Gently tuck chin and adjust monitor height.';
        } else if (viewingDistanceCm < 45) {
          guidanceText = 'Screen distance below 45cm. Lean back slightly to relieve eye and neck strain.';
        } else {
          guidanceText = 'Sustained posture deviation. Shift shoulders and align ears over clavicles.';
        }
      } else {
        // Less than 15s or <75% of rolling 30s window: alert suppressed
        state = 'TRANSIENT_SHIFT';
        guidanceText = 'Brief reach or shift detected (alert suppressed).';
      }
    } else {
      state = 'OPTIMAL';
      guidanceText = 'Optimal ergonomic comfort. Balanced natural movement.';
    }

    return {
      cervicalAngleDeg,
      torsoInclinationDeg,
      shoulderAsymmetryRatio,
      shoulderTiltDeg,
      viewingDistanceCm,
      zScore: maxZScore,
      landmarkConfidence: Number(meanConfidence.toFixed(2)),
      hipsVisible,
      microMotionVariance,
      state,
      deviationRatio: Number(deviationRatio.toFixed(2)),
      guidanceText,
    };
  }

  /**
   * Closed-Loop Adaptive Baseline Tuning
   * User clicks "I'm Comfortable / False Alert"
   * Updates: sigma_i <- min(1.10 * sigma_i, 8.0) and mu_i <- 0.90 * mu_i + 0.10 * m_i
   */
  public recordComfortableFeedback(currentCervical: number, currentTorso: number) {
    const prev = this.activeBaseline;
    this.activeBaseline = {
      ...prev,
      cervicalFlexion: {
        ...prev.cervicalFlexion,
        stdDev: Number(Math.min(prev.cervicalFlexion.stdDev * 1.1, 8.0).toFixed(2)),
        mean: Number((prev.cervicalFlexion.mean * 0.9 + currentCervical * 0.1).toFixed(1)),
      },
      torsoInclination: {
        ...prev.torsoInclination,
        stdDev: Number(Math.min(prev.torsoInclination.stdDev * 1.1, 7.0).toFixed(2)),
        mean: Number((prev.torsoInclination.mean * 0.9 + currentTorso * 0.1).toFixed(1)),
      },
    };
    return this.activeBaseline;
  }

  /**
   * Adaptive Threshold Tightening
   * Called when user logs discomfort >= 5/10 with 0 alerts
   * Tightens baseline tolerances by 10%
   */
  public tightenThresholds() {
    const prev = this.activeBaseline;
    this.activeBaseline = {
      ...prev,
      cervicalFlexion: {
        ...prev.cervicalFlexion,
        stdDev: Number(Math.max(prev.cervicalFlexion.stdDev * 0.9, 2.0).toFixed(2)),
      },
      torsoInclination: {
        ...prev.torsoInclination,
        stdDev: Number(Math.max(prev.torsoInclination.stdDev * 0.9, 1.8).toFixed(2)),
      },
    };
    return this.activeBaseline;
  }

  /**
   * Exercise Form Coach 4-State Finite State Machine:
   * READY -> ECCENTRIC -> HOLD -> CONCENTRIC -> READY (Rep + 1)
   */
  public processExerciseFrame(
    exercise: ExerciseType,
    rawLandmarks: Point3D[],
    timestamp: number = Date.now()
  ): ExerciseSessionState {
    const lm = this.smoothLandmarks(rawLandmarks);

    if (exercise === 'squats') {
      // Track hip and knee Y positions
      const hipY = (lm[23].y + lm[24].y) / 2;
      const kneeY = (lm[25].y + lm[26].y) / 2;
      const ankleY = (lm[27].y + lm[28].y) / 2;

      // Depth metric: hip relative to knee
      const totalLegSpan = Math.abs(ankleY - hipY) || 0.4;
      const kneeHipDelta = hipY - kneeY; // positive when hips descend
      const depthPct = Math.max(0, Math.min(100, Math.round(((hipY - 0.5) / 0.3) * 100)));

      // Bilateral knee symmetry
      const kneeSymmetry = Math.round(100 - Math.abs(lm[25].y - lm[26].y) * 200);

      const fsm = this.exerciseState.fsmState;
      let nextFsm: ExerciseFSMState = fsm;
      let cue = this.exerciseState.guidanceCue;

      if (fsm === 'READY') {
        if (depthPct > 20) {
          nextFsm = 'ECCENTRIC';
          this.repStartTime = timestamp;
          cue = 'Lowering with control. Keep knees tracking over toes.';
        } else {
          cue = 'Stand tall with feet shoulder-width apart to begin.';
        }
      } else if (fsm === 'ECCENTRIC') {
        if (depthPct >= 75) {
          nextFsm = 'HOLD';
          cue = 'Parallel depth reached! Hold steady.';
        } else {
          cue = `Lowering: ${depthPct}%. Drive hips back smoothly.`;
        }
      } else if (fsm === 'HOLD') {
        if (depthPct < 60) {
          nextFsm = 'CONCENTRIC';
          cue = 'Power up through midfoot and glutes.';
        }
      } else if (fsm === 'CONCENTRIC') {
        if (depthPct <= 15) {
          nextFsm = 'READY';
          this.exerciseState.reps += 1;
          const tempo = ((timestamp - this.repStartTime) / 1000).toFixed(1);
          cue = `Rep completed in ${tempo}s! Symmetry: ${kneeSymmetry}%. Reset for next rep.`;
        }
      }

      this.exerciseState = {
        ...this.exerciseState,
        exercise,
        fsmState: nextFsm,
        currentDepthPct: depthPct,
        symmetryScore: Math.max(70, Math.min(100, kneeSymmetry)),
        guidanceCue: cue,
      };
    } else if (exercise === 'chin_tucks') {
      // Cervical chin tuck: tracks ear vs nose Z and Y alignment
      const earZ = (lm[7].z + lm[8].z) / 2;
      const noseZ = lm[0].z;
      const tuckDepth = Math.max(0, Math.min(100, Math.round((noseZ - earZ + 0.05) * 800)));

      let nextFsm = this.exerciseState.fsmState;
      let cue = this.exerciseState.guidanceCue;

      if (this.exerciseState.fsmState === 'READY') {
        if (tuckDepth > 30) {
          nextFsm = 'ECCENTRIC';
          this.repStartTime = timestamp;
          cue = 'Glide chin horizontally back like making a gentle double chin.';
        }
      } else if (this.exerciseState.fsmState === 'ECCENTRIC') {
        if (tuckDepth > 65) {
          nextFsm = 'HOLD';
          cue = 'Hold cervical retraction. Lengthen the back of the neck.';
        }
      } else if (this.exerciseState.fsmState === 'HOLD') {
        if (tuckDepth < 40) {
          nextFsm = 'CONCENTRIC';
        }
      } else if (this.exerciseState.fsmState === 'CONCENTRIC') {
        if (tuckDepth < 20) {
          nextFsm = 'READY';
          this.exerciseState.reps += 1;
          cue = 'Rep complete. Relax jaw and repeat.';
        }
      }

      this.exerciseState = {
        ...this.exerciseState,
        exercise,
        fsmState: nextFsm,
        currentDepthPct: tuckDepth,
        symmetryScore: 96,
        guidanceCue: cue,
      };
    }

    return this.exerciseState;
  }

  /**
   * Factory Ergonomic Mode: Tracks repetitive upper-limb cycles (shoulder/elbow elevation)
   */
  public processFactoryArmCadence(rawLandmarks: Point3D[], timestamp: number = Date.now()): number {
    const lm = this.smoothLandmarks(rawLandmarks);
    // Shoulder Y vs Wrist Y (in inverted coords, lower Y is higher physical elevation)
    const shoulderY = (lm[11].y + lm[12].y) / 2;
    const wristY = (lm[15].y + lm[16].y) / 2;
    const isElevated = wristY < shoulderY + 0.05; // Hands elevated to or above shoulder level

    this.factoryElevationHistory.push({ timestamp, elevated: isElevated });
    // Keep 60 seconds of history
    this.factoryElevationHistory = this.factoryElevationHistory.filter((i) => timestamp - i.timestamp <= 60000);

    // Count transitions from not elevated -> elevated
    let transitions = 0;
    for (let i = 1; i < this.factoryElevationHistory.length; i++) {
      if (!this.factoryElevationHistory[i - 1].elevated && this.factoryElevationHistory[i].elevated) {
        transitions++;
      }
    }
    return transitions; // cycles per minute
  }

  /**
   * Elderly Balance Mode: Mediolateral postural sway (horizontal center of mass variance)
   */
  public processElderlySway(rawLandmarks: Point3D[], timestamp: number = Date.now()): number {
    const lm = this.smoothLandmarks(rawLandmarks);
    const midHipX = (lm[23].x + lm[24].x) / 2;
    this.swayCenterHistory.push({ timestamp, x: midHipX });
    this.swayCenterHistory = this.swayCenterHistory.filter((i) => timestamp - i.timestamp <= 10000); // 10s window

    if (this.swayCenterHistory.length < 5) return 0.5;

    const meanX = this.swayCenterHistory.reduce((s, i) => s + i.x, 0) / this.swayCenterHistory.length;
    const variance =
      this.swayCenterHistory.reduce((s, i) => s + (i.x - meanX) ** 2, 0) / this.swayCenterHistory.length;
    // Scaled mm sway estimate
    return Number((Math.sqrt(variance) * 1000).toFixed(1)); // Sway in mm
  }

  private createUnreliableMetrics(guidance: string): BiomechanicalMetrics {
    return {
      cervicalAngleDeg: 12,
      torsoInclinationDeg: 4,
      shoulderAsymmetryRatio: 0.02,
      shoulderTiltDeg: 0,
      viewingDistanceCm: 55,
      zScore: 0.5,
      landmarkConfidence: 0.4,
      hipsVisible: false,
      microMotionVariance: 1.5,
      state: 'UNRELIABLE_VIEW',
      deviationRatio: 0,
      guidanceText: guidance,
    };
  }
}
