const express = require('express');
const router = express.Router();
const { createGrievance, getGrievances, updateGrievance, upvoteGrievance, addComment, getComments, deleteGrievance, triageGrievance, secretaryActionGrievance } = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('citizen'), createGrievance)
  .get(protect, getGrievances);

router.route('/:id')
  .put(protect, authorize('ward_member', 'secretary', 'higher_authority', 'admin'), updateGrievance)
  .delete(protect, authorize('citizen'), deleteGrievance);

router.put('/:id/triage', protect, authorize('ward_member'), triageGrievance);
router.put('/:id/secretary-action', protect, authorize('secretary'), secretaryActionGrievance);

router.post('/:id/upvote', protect, upvoteGrievance);

router.route('/:id/comments')
  .post(protect, addComment)
  .get(protect, getComments);

module.exports = router;
