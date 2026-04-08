const express = require('express');
const router = express.Router();
const { submitRequest, getRequests, updateRequest } = require('../controllers/mgnregaController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('citizen'), submitRequest)
  .get(protect, getRequests);

router.route('/:id')
  .put(protect, authorize('secretary', 'higher_authority'), updateRequest);

module.exports = router;
