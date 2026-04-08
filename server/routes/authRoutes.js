const express = require('express');
const router = express.Router();
const { registerUser, loginUser, approveCitizen, rejectCitizen, createAuthorityAccount, getAllUsers, getUnapprovedCitizens, getApprovedCitizens, editUserAccount, deleteUserAccount } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/unapproved', protect, authorize('secretary', 'admin'), getUnapprovedCitizens);
router.get('/approved', protect, authorize('secretary', 'admin'), getApprovedCitizens);
router.put('/approve/:id', protect, authorize('secretary', 'admin'), approveCitizen);
router.put('/reject/:id', protect, authorize('secretary', 'admin'), rejectCitizen);
router.post('/admin/create-authority', protect, authorize('admin'), createAuthorityAccount);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.route('/admin/users/:id')
  .put(protect, authorize('admin', 'higher_authority'), editUserAccount)
  .delete(protect, authorize('admin'), deleteUserAccount);

module.exports = router;
