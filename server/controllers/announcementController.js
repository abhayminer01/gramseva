const Announcement = require('../models/Announcement');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Ward Member, Secretary)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, targetAudience } = req.body;
    
    let finalTargetAudience = targetAudience;
    if (req.user.role === 'ward_member') {
      finalTargetAudience = req.user.wardNumber;
    }
    
    const announcement = await Announcement.create({
      title,
      content,
      type,
      targetAudience: finalTargetAudience,
      createdBy: req.user._id,
      localBody: req.user.localBodyName
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const { localBodyName, wardNumber } = req.user;
    
    // Everyone sees their local body announcements AND 'State' level announcements (from higher authority)
    const filter = {
      localBody: { $in: [localBodyName, 'State'] }
    };
    
    // Citizens and Ward Members see 'all' plus their specific ward.
    // Secretaries only see 'all' (they don't need to see every individual ward's local announcements).
    if (req.user.role === 'citizen' || req.user.role === 'ward_member') {
      filter.$or = [
        { targetAudience: 'all' },
        { targetAudience: wardNumber || '' }
      ];
    } else if (req.user.role === 'secretary' || req.user.role === 'higher_authority') {
      filter.targetAudience = 'all';
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Ward Member, Secretary)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if the user is authorized to delete (must be from the same local body)
    if (announcement.localBody !== req.user.localBodyName) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Ward Member, Secretary)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, type, targetAudience } = req.body;
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if the user is authorized to edit (must be from the same local body)
    if (announcement.localBody !== req.user.localBodyName) {
      return res.status(403).json({ message: 'Not authorized to edit this announcement' });
    }

    let finalTargetAudience = targetAudience || announcement.targetAudience;
    if (req.user.role === 'ward_member') {
      finalTargetAudience = req.user.wardNumber;
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.type = type || announcement.type;
    announcement.targetAudience = finalTargetAudience;

    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement, updateAnnouncement };
