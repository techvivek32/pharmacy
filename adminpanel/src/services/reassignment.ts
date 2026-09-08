import Pharmacy from '@/models/Pharmacy';
import Patient from '@/models/Patient';
import Quote from '@/models/Quote';
import { sendNotificationToUser, sendNotificationToPharmacy } from '@/services/notification';

/**
 * Move a prescription to the next nearest approved pharmacy that has not
 * already rejected or been accepted for it. Notifies the newly assigned
 * pharmacy and the patient. Returns false when no untried pharmacy is left,
 * in which case the prescription is NOT modified — the caller decides the
 * fallback (keep pending, expire, etc).
 */
export async function reassignPrescriptionToNextPharmacy(prescription: any): Promise<boolean> {
  // Pharmacies already tried for this prescription
  const triedQuotes = await Quote.find({
    prescriptionId: prescription._id,
    status: { $in: ['rejected', 'accepted'] },
  }).lean() as any[];

  const triedIds = triedQuotes.map((q: any) => q.pharmacyId.toString());

  // Find next nearest untried approved pharmacy
  let nextPharmacy = null;

  if (prescription.deliveryAddress?.location?.coordinates?.length === 2) {
    nextPharmacy = await Pharmacy.findOne({
      _id: { $nin: triedIds },
      approvalStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: prescription.deliveryAddress.location.coordinates,
          },
        },
      },
    }).lean() as any;
  } else {
    nextPharmacy = await Pharmacy.findOne({
      _id: { $nin: triedIds },
      approvalStatus: 'approved',
    }).lean() as any;
  }

  if (!nextPharmacy) {
    return false;
  }

  prescription.nearbyPharmacies = [nextPharmacy._id];
  prescription.assignedAt = new Date();
  prescription.status = 'pending';
  await prescription.save();

  // Notify the newly assigned pharmacy
  try {
    await sendNotificationToPharmacy(
      nextPharmacy._id.toString(),
      'New Prescription Request',
      'A new prescription request is waiting for your quote.',
      { prescriptionId: prescription._id.toString(), type: 'prescription_request' }
    );
  } catch (_) {}

  // Notify the patient
  try {
    const patient = await Patient.findById(prescription.patientId).lean() as any;
    if (patient) {
      await sendNotificationToUser(
        patient.userId.toString(),
        'Prescription Reassigned',
        'Your prescription has been sent to another nearby pharmacy.',
        { prescriptionId: prescription._id.toString(), type: 'prescription_reassigned' }
      );
    }
  } catch (_) {}

  return true;
}
