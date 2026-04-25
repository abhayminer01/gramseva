const MgnregaRequest = require('../models/MgnregaRequest');

// @desc    Submit MGNREGA request
// @route   POST /api/mgnrega
// @access  Private (Citizen)
const submitRequest = async (req, res) => {
  try {
    const { title, location, images } = req.body;
    
    const request = await MgnregaRequest.create({
      citizenId: req.user._id,
      title,
      location,
      images: images || [],
      district: req.user.district,
      localBodyType: req.user.localBodyType,
      localBodyName: req.user.localBodyName,
      wardNumber: req.user.wardNumber
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MGNREGA requests
// @route   GET /api/mgnrega
// @access  Private (Citizen, Secretary, Higher Authority)
const getRequests = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === 'citizen') {
      filter.citizenId = _id;
    } else if (role === 'secretary') {
      // Show all requests for this secretary's local body
      filter.district = req.user.district;
      filter.localBodyType = req.user.localBodyType;
      filter.localBodyName = req.user.localBodyName;
    } else if (role === 'higher_authority') {
      filter.status = 'forwarded';
      filter.district = req.user.district;
    }

    const requests = await MgnregaRequest.find(filter)
      .populate('citizenId', 'name phone rationCardNumber')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update MGNREGA request
// @route   PUT /api/mgnrega/:id
// @access  Private (Secretary, Higher Authority)
const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MgnregaRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.reviewedBy = req.user._id;

    const updated = await request.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Delete MGNREGA request
// @route   DELETE /api/mgnrega/:id
// @access  Private (Citizen)
const deleteRequest = async (req, res) => {
  try {
    const request = await MgnregaRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the creator can delete it, and only if it's pending
    if (request.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete request after it has been reviewed' });
    }

    await MgnregaRequest.deleteOne({ _id: request._id });
    res.json({ message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitRequest, getRequests, updateRequest, deleteRequest };
