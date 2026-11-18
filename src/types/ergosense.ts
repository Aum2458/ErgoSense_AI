export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export type UserRole = 'admin' | 'user';

// Master System Prompt v2.0: 5-State Temporal Hysteresis Machine
export type BiomechanicalState =
  | 'OPTIMAL'             // Emerald: within personal baseline
  | 'TRANSIENT_SHIFT'     // Amber: <15s normal reach, alert suppressed
  | 'SUSTAINED_DEVIATION' // Rose: persists >=75% of rolling 30s window
  | 'STATIC_FATIGUE'      // Cyan: prolonged immobility >40 mins
  | 'UNRELIABLE_VIEW';    // Slate: landmark visibility <0.65 or camera off

export type PostureStatus = 'optimal' | 'attention' | 'severe';

export type ActivityMode =
  | 'sitting_desk'
  | 'standing_desk'
  | 'exercise_coach'
  | 'desk_analyzer'
  | 'factory_mode'
  | 'elderly_balance'
  | 'travel_imu'
  | 'driving_safe';

export type PersonaId =
  | 'students'
  | 'office_employees'
  | 'developers'
  | 'gamers'
  | 'drivers'
  | 'factory_workers'
  | 'elderly_people'
  | 'freelancers'
  | 'fitness_enthusiasts';

export type WorkstationType =
  | 'laptop'
  | 'external_monitor'
  | 'standing_desk'
  | 'mobile_travel'
  | 'factory_floor';

export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface PersonalBaselineMetric {
  mean: number;        // mu_i
  stdDev: number;      // sigma_i
  minComfortable: number;
  maxComfortable: number;
}

export interface PersonalBaseline {
  cervicalFlexion: PersonalBaselineMetric; // deg
  torsoInclination: PersonalBaselineMetric; // deg
  shoulderAsymmetry: PersonalBaselineMetric; // ratio
  baselineZDepth: number; // z_baseline
  shoulderPixelWidth: number;
  calibratedAt: number;
  isCalibrated: boolean;
  phaseACompleted: boolean; // Sitting 30s
  phaseBCompleted: boolean; // Standing 30s
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  activeGoals: string[];
  persona?: PersonaId;
  workstation?: WorkstationType;
  language?: SupportedLanguage;
  baseline?: PersonalBaseline;
}

export interface LinkedDevice {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'desktop';
  lastActive: number;
  isCurrent: boolean;
  ipLocation: string;
  status: 'online' | 'idle' | 'offline';
  batteryLevel: number;
  latestErgoScore: number;
  latestPostureStatus: PostureStatus;
  cervicalTiltDeg: number;
  proximityCm: number;
}

export interface ErgoScoreSnapshot {
  userId: string;
  timestamp: number;
  overall: number;
  posture: number;
  eyes: number;
  fatigue: number;
  staticHabit: number;
  recovery: number;
}

export interface TelemetryPayload {
  userId: string;
  deviceId?: string;
  timestamp: number;
  cervicalTiltDeg: number;       // Neck tilt in degrees (0 - 45)
  proximityCm: number;           // Distance to screen in cm (20 - 90)
  headPitchDeg?: number;         // Pitch
  headRollDeg?: number;          // Lateral tilt
  torsoLeanDeg?: number;         // Torso inclination (0 - 45)
  shoulderTiltDeg?: number;      // Shoulder tilt deg
  shoulderAsymmetryRatio?: number;
  blinkRatePerMin?: number;      // Blinks per minute (normal 15-20)
  fatigueIndex?: number;         // 0 - 100%
  ambientLightLux?: number;      // Light intensity
  batteryLevel?: number;         // Battery percentage
  status?: PostureStatus;
  biomechanicalState?: BiomechanicalState;
  ergoScore?: number;
  activityMode?: ActivityMode;
  zScore?: number;
  landmarkConfidence?: number;   // 0.0 - 1.0
  fps?: number;
  latencyMs?: number;
}

export interface BuzzEvent {
  userId: string;
  deviceId?: string;
  intensity?: 'gentle' | 'medium' | 'sharp';
  pattern?: number[];            // Vibration pattern in ms, e.g. [200, 100, 200]
  source: 'web_client' | 'admin_fleet' | 'rule_engine';
  timestamp: number;
  message?: string;
}

// Exercise Form Coach Finite State Machine
export type ExerciseFSMState = 'READY' | 'ECCENTRIC' | 'HOLD' | 'CONCENTRIC';
export type ExerciseType = 'squats' | 'chin_tucks' | 'thoracic_extensions' | 'overhead_reaches';

export interface ExerciseSessionState {
  exercise: ExerciseType;
  fsmState: ExerciseFSMState;
  reps: number;
  tempoSec: number;
  symmetryScore: number;
  currentDepthPct: number;
  guidanceCue: string;
}

// Pain & Comfort Journal
export type BodyZone =
  | 'cervical_neck'
  | 'upper_trapezius'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'thoracic_back'
  | 'lumbar_lower_back'
  | 'wrists_forearms'
  | 'hips_pelvis'
  | 'knees';

export interface PainJournalEntry {
  id: string;
  timestamp: number;
  zone: BodyZone;
  intensity: number; // 1 - 10
  sensations: string[]; // e.g., 'Stiffness', 'Fatigue', 'Tension', 'Sharp'
  taskContext: string; // e.g., 'Late afternoon coding', 'Exam study session'
  didAiHelp: boolean;
  correlatedZScore?: number;
  adaptedThresholdApplied?: boolean;
}

// Volunteer Validation Suite (B.Tech Benchmark)
export interface VolunteerTrial {
  id: string; // e.g. 'VOL-01'
  name: string;
  age: number;
  gender: string;
  bodyType: string; // 'Short/Petite', 'Average', 'Tall', 'High BMI'
  clothingType: string; // 'Loose Hoodie', 'Fitted T-Shirt', 'Collar Shirt'
  lightingTag: 'Bright Daylight' | 'Indoor Normal' | 'Dim Light';
  cameraPlacement: '0° Eye-Level' | '15° Laptop Below-Eye' | '30° Oblique Angle';
  baselineCalibrated: boolean;
  groundTruthState: 'Good' | 'Deviated';
  aiDetectedState: 'Good' | 'Deviated';
  isCorrect: boolean;
  cervicalAngle: number;
  shoulderTilt: number;
  latencyMs: number;
  fps: number;
  confidence: number;
  timestamp: number;
  consentSigned: boolean;
}

export interface BenchmarkMetrics {
  totalTrials: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  meanLatencyMs: number;
  p95LatencyMs: number;
  meanFps: number;
  calibratedFalseAlertDropPct: number;
  privacyBytesUploaded: number;
}
