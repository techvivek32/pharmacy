import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  deliveryFee: number;
  commissionRate: number;
  minOrderAmount: number;
  maxDeliveryRadius: number;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    deliveryFee: { type: Number, default: 20 },
    commissionRate: { type: Number, default: 15 },
    minOrderAmount: { type: Number, default: 50 },
    maxDeliveryRadius: { type: Number, default: 10 },
    supportEmail: { type: String, default: 'support@ordogo.com' },
    supportPhone: { type: String, default: '+212 600 000 000' },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
