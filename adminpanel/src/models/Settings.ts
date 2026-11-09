import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceFeeTier {
  maxAmount: number; // order subtotal up to (and including) this amount...
  fee: number;       // ...pays this flat pharmacy/service fee
}

export interface ISettings extends Document {
  deliveryFee: number; // delivery price per kilometre
  minDeliveryFee: number; // minimum delivery fee regardless of distance
  serviceFeeTiers: IServiceFeeTier[]; // flat pharmacy fee by subtotal tier
  serviceFeeAbove: number; // fee when subtotal exceeds the last tier
  commissionRate: number; // legacy, no longer used in pricing
  minCommission: number; // legacy, no longer used in pricing
  minOrderAmount: number;
  maxDeliveryRadius: number;
  minWithdrawalAmount: number;
  supportEmail: string;
  supportPhone: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    deliveryFee: { type: Number, default: 25 },
    minDeliveryFee: { type: Number, default: 100 },
    serviceFeeTiers: {
      type: [
        {
          maxAmount: { type: Number, required: true },
          fee: { type: Number, required: true },
          _id: false,
        },
      ],
      default: [
        { maxAmount: 500, fee: 50 },
        { maxAmount: 1000, fee: 70 },
        { maxAmount: 2000, fee: 100 },
      ],
    },
    serviceFeeAbove: { type: Number, default: 150 },
    commissionRate: { type: Number, default: 15 },
    minCommission: { type: Number, default: 500 },
    minOrderAmount: { type: Number, default: 50 },
    maxDeliveryRadius: { type: Number, default: 10 },
    minWithdrawalAmount: { type: Number, default: 100 },
    supportEmail: { type: String, default: 'support@ordogo.com' },
    supportPhone: { type: String, default: '+212 600 000 000' },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
