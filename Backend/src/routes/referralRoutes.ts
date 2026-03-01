import express from 'express';
import {
  createReferral,
  deleteReferralByPatientId,
  getAllReferrals,
  getReferralsByPatientId,
  getReferralsByPractitionerId,
  updateReferralByPatientId,
} from '../controllers/referralController';

const ReferralRouter = express.Router();

// GET /api/referrals - Get all referrals
ReferralRouter.get('/', getAllReferrals);

// GET /api/referrals/patient/:patientId - Get referrals by patientId
ReferralRouter.get('/patient/:patientId', getReferralsByPatientId);

// GET /api/referrals/practitioner/:practitionerId - Get referrals by practitionerId
ReferralRouter.get('/practitioner/:practitionerId', getReferralsByPractitionerId);

// POST /api/referrals - Create a new referral
ReferralRouter.post('/', createReferral);

// PUT /api/referrals/patient/:patientId - Update referrals by patientId
ReferralRouter.put('/patient/:patientId', updateReferralByPatientId);

// DELETE /api/referrals/patient/:patientId - Delete referrals by patientId
ReferralRouter.delete('/patient/:patientId', deleteReferralByPatientId);

export default ReferralRouter;