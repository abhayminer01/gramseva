const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement, updateAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('ward_member', 'secretary', 'higher_authority'), createAnnouncement)
  .get(protect, getAnnouncements);

router.route('/:id')
  .put(protect, authorize('ward_member', 'secretary', 'higher_authority'), updateAnnouncement)
  .delete(protect, authorize('ward_member', 'secretary', 'higher_authority'), deleteAnnouncement);

module.exports = router;
