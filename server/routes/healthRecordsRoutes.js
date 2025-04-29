const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getPatientProfile,
  getEmergencyContacts,
  getMedicalHistory,
  getAllergies,
  getChronicConditions,
  getMedications,
  getVitalsHistory,
  getImmunizations
} = require('../controllers/healthRecordsController');

// All routes are protected with auth middleware
router.get('/profile', protect, getPatientProfile);
router.get('/emergency-contacts', protect, getEmergencyContacts);
router.get('/medical-history', protect, getMedicalHistory);
router.get('/allergies', protect, getAllergies);
router.get('/chronic-conditions', protect, getChronicConditions);
router.get('/medications', protect, getMedications);
router.get('/vitals-history', protect, getVitalsHistory);
router.get('/immunizations', protect, getImmunizations);

module.exports = router;