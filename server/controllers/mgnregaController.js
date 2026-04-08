const MgnregaRequest = require('../models/MgnregaRequest');

// @desc    Submit MGNREGA request
// @route   POST /api/mgnrega
// @access  Private (Citizen)
const submitRequest = async (req, res) => {
  try {
    const { description, landDetails } = req.body;
    
    const request = await MgnregaRequest.create({
      citizenId: req.user._id,
      description,
      landDetails
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
      filter.status = 'pending';
    } else if (role === 'higher_authority') {
      filter.status = 'forwarded';
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

module.exports = { submitRequest, getRequests, updateRequest };
