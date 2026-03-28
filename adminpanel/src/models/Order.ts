import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  prescriptionId: mongoose.Types.ObjectId;
  quoteId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  pharmacyId: mongoose.Types.ObjectId;
  riderId?: mongoose.Types.ObjectId;
  items: Array<{
    medicineName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryAddress: {
    address: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  pharmacyAddress: {
    address: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    pharmacyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
    },
    items: [
      {
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    deliveryAddress: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    pharmacyAddress: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    estimatedDeliveryTime: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ patientId: 1 });
OrderSchema.index({ pharmacyId: 1 });
OrderSchema.index({ riderId: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
