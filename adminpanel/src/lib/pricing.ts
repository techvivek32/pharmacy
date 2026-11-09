// Central pricing rules, driven by the admin-editable Settings document.
// Used by send-quote and quote-preview so both always agree.

export const PRICING_DEFAULTS = {
  deliveryFeePerKm: 25,
  minDeliveryFee: 100,
  serviceFeeTiers: [
    { maxAmount: 500, fee: 50 },
    { maxAmount: 1000, fee: 70 },
    { maxAmount: 2000, fee: 100 },
  ],
  serviceFeeAbove: 150,
};

export interface ServiceFeeTier {
  maxAmount: number;
  fee: number;
}

export function getPricing(settings: any) {
  const tiers: ServiceFeeTier[] =
    Array.isArray(settings?.serviceFeeTiers) && settings.serviceFeeTiers.length > 0
      ? [...settings.serviceFeeTiers].sort((a, b) => a.maxAmount - b.maxAmount)
      : PRICING_DEFAULTS.serviceFeeTiers;

  return {
    deliveryFeePerKm: settings?.deliveryFee ?? PRICING_DEFAULTS.deliveryFeePerKm,
    minDeliveryFee: settings?.minDeliveryFee ?? PRICING_DEFAULTS.minDeliveryFee,
    serviceFeeTiers: tiers,
    serviceFeeAbove: settings?.serviceFeeAbove ?? PRICING_DEFAULTS.serviceFeeAbove,
  };
}

/** Flat pharmacy/service fee for a medicine subtotal, by tier. */
export function computeServiceFee(subtotal: number, settings: any): number {
  const { serviceFeeTiers, serviceFeeAbove } = getPricing(settings);
  for (const tier of serviceFeeTiers) {
    if (subtotal < tier.maxAmount) return tier.fee;
  }
  return serviceFeeAbove;
}

/**
 * Delivery fee for the pharmacy→customer distance (km):
 * per-km rate with an absolute minimum. Unknown distance pays the minimum.
 */
export function computeDeliveryFee(distanceKm: number | null, settings: any): number {
  const { deliveryFeePerKm, minDeliveryFee } = getPricing(settings);
  if (distanceKm == null || !isFinite(distanceKm) || distanceKm <= 0) {
    return minDeliveryFee;
  }
  const fee = parseFloat((distanceKm * deliveryFeePerKm).toFixed(2));
  return Math.max(fee, minDeliveryFee);
}
