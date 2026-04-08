const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('ward_member', 'secretary'), createAnnouncement)
  .get(protect, getAnnouncements);

module.exports = router;
