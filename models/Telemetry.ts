import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITelemetry extends Document {
  ergoScore: number;
  neckFlexion: number;
  shoulderTilt: number;
  torsoLean: number;
  deviceTilt: {
    pitch: number;
    roll: number;
  };
  ambientLight: number;
  proximity: number;
  blinkRate?: number;
  fatigueIndex?: number;
  status: 'optimal' | 'attention' | 'severe';
  alertMessage?: string;
  deviceId?: string;
  timestamp: Date;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    ergoScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 78,
    },
    neckFlexion: {
      type: Number,
      required: true,
      default: 14,
    },
    shoulderTilt: {
      type: Number,
      required: true,
      default: 1.5,
    },
    torsoLean: {
      type: Number,
      required: true,
      default: 4,
    },
    deviceTilt: {
      pitch: { type: Number, default: 14 },
      roll: { type: Number, default: 3 },
    },
    ambientLight: {
      type: Number,
      required: true,
      default: 60,
    },
    proximity: {
      type: Number,
      default: 54,
    },
    blinkRate: {
      type: Number,
      default: 18,
    },
    fatigueIndex: {
      type: Number,
      default: 22,
    },
    status: {
      type: String,
      enum: ['optimal', 'attention', 'severe'],
      default: 'optimal',
    },
    alertMessage: {
      type: String,
      default: '',
    },
    deviceId: {
      type: String,
      default: 'edge-client-01',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const TelemetryModel: Model<ITelemetry> =
  mongoose.models.Telemetry || mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);

export default TelemetryModel;
