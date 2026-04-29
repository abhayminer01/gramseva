const Grievance = require('../models/Grievance');
const Comment = require('../models/Comment');

// @desc    Create a grievance
// @route   POST /api/grievances
// @access  Private (Citizen)
const createGrievance = async (req, res) => {
  try {
    const { title, description, category, images } = req.body;
    
    const { localBodyName, wardNumber, district } = req.user;

    const grievance = await Grievance.create({
      title,
      description,
      category,
      images: images || [],
      createdBy: req.user._id,
      localBody: localBodyName,
      district: district,
      ward: wardNumber
    });

    res.status(201).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grievances based on role
// @route   GET /api/grievances
// @access  Private
const getGrievances = async (req, res) => {
  try {
    const { role, localBodyName, wardNumber, district } = req.user;
    let filter = {};

    if (role === 'citizen') {
      filter.district = district;
      filter.localBody = localBodyName;
      filter.ward = wardNumber;
    } else if (role === 'ward_member') {
      filter.district = district;
      filter.localBody = localBodyName;
      filter.ward = wardNumber;
    } else if (role === 'secretary') {
      filter.district = district;
      filter.localBody = localBodyName;
    } else if (role === 'higher_authority') {
      filter.escalatedToHigher = true;
    }

    const grievances = await Grievance.find(filter)
      .populate('createdBy', 'name phone')
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grievance status/priority
// @route   PUT /api/grievances/:id
// @access  Private (Ward Member / Secretary / Higher Authority)
const updateGrievance = async (req, res) => {
  try {
    const { status, priority, deadline } = req.body;
    
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Role-based logic could be expanded here. For now, trust the auth middleware mapping.
    if (status) grievance.status = status;
    if (priority) grievance.priority = priority;
    if (deadline) grievance.deadline = deadline;

    const updated = await grievance.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote grievance
// @route   POST /api/grievances/:id/upvote
// @access  Private
const upvoteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    if (grievance.createdBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot upvote your own grievance' });
    }

    if (grievance.upvotes.includes(req.user._id)) {
      // Remove upvote
      grievance.upvotes = grievance.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      grievance.upvotes.push(req.user._id);
    }

    await grievance.save();
    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on grievance
// @route   POST /api/grievances/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    if (grievance.createdBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot comment on your own grievance' });
    }
    
    const comment = await Comment.create({
      grievanceId: req.params.id,
      userId: req.user._id,
      message
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for grievance
// @route   GET /api/grievances/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ grievanceId: req.params.id })
      .populate('userId', 'name role')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a grievance
// @route   DELETE /api/grievances/:id
// @access  Private (Citizen)
const deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    if (grievance.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own grievances' });
    }

    if (grievance.status !== 'pending') {
      return res.status(400).json({ message: 'You cannot modify returning once an authority has responded' });
    }

    await Grievance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grievance removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Triage grievance (Ward Member)
// @route   PUT /api/grievances/:id/triage
// @access  Private (Ward Member)
const triageGrievance = async (req, res) => {
  try {
    const { action, reason, priority } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    if (action === 'forward') {
      grievance.status = 'escalated';
      grievance.escalatedToHigher = true;
      grievance.actionReason = reason;
      if (priority) grievance.priority = priority;
    } else if (action === 'decline') {
      grievance.status = 'rejected';
      grievance.actionReason = reason;
    } else {
      return res.status(400).json({ message: 'Invalid triage action' });
    }

    const updated = await grievance.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Secretary action on escalated grievance
// @route   PUT /api/grievances/:id/secretary-action
// @access  Private (Secretary)
const secretaryActionGrievance = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    if (action === 'resolve') {
      grievance.status = 'resolved';
      grievance.actionReason = reason;
    } else if (action === 'decline') {
      grievance.status = 'rejected';
      grievance.actionReason = reason;
    } else {
      return res.status(400).json({ message: 'Invalid secretary action' });
    }

    const updated = await grievance.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all grievances (Admin only)
// @route   GET /api/grievances/admin/all
// @access  Private (Admin)
const getAllGrievancesAdmin = async (req, res) => {
  try {
    const grievances = await Grievance.find()
       .populate('createdBy', 'name phone localBodyName wardNumber')
       .sort({ createdAt: -1 });
    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any grievance (Admin only)
// @route   DELETE /api/grievances/admin/:id
// @access  Private (Admin)
const deleteGrievanceAdmin = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    await grievance.deleteOne();
    res.json({ message: 'Grievance completely removed by Admin', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createGrievance, 
  getGrievances, 
  updateGrievance, 
  upvoteGrievance, 
  addComment, 
  getComments, 
  deleteGrievance, 
  triageGrievance,
  secretaryActionGrievance,
  getAllGrievancesAdmin,
  deleteGrievanceAdmin
};
